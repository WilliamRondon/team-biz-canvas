
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

// Tipos para os eventos de canvas
export type CanvasItemEvent = {
  id: string;
  section_id: string;
  content: string;
  created_by: string;
  status: string;
  workspace_type: string;
  created_at: string;
  updated_at: string;
  locked_by: string | null;
  locked_at: string | null;
};

export type CanvasPresenceUser = {
  user_id: string;
  business_plan_id: string;
  online_at: string;
  cursor_position?: {
    x: number;
    y: number;
    section_id?: string;
    item_id?: string;
  };
};

export type CanvasPresenceState = Record<string, CanvasPresenceUser[]>;

type CanvasEventHandlers = {
  onItemCreated?: (item: CanvasItemEvent) => void;
  onItemUpdated?: (item: CanvasItemEvent) => void;
  onItemDeleted?: (id: string) => void;
  onItemLocked?: (item: CanvasItemEvent) => void;
  onItemUnlocked?: (item: CanvasItemEvent) => void;
  onPresenceChanged?: (state: CanvasPresenceState) => void;
  onCursorMoved?: (user_id: string, position: CanvasPresenceUser['cursor_position']) => void;
};

export const useRealtimeCanvas = (
  businessPlanId: string,
  handlers: CanvasEventHandlers = {}
) => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [presenceState, setPresenceState] = useState<CanvasPresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Função para atualizar a posição do cursor
  const updateCursorPosition = useCallback(
    (position: CanvasPresenceUser['cursor_position']) => {
      if (!channel || !user?.id || !isConnected) return;

      channel.track({
        user_id: user.id,
        business_plan_id: businessPlanId,
        online_at: new Date().toISOString(),
        cursor_position: position,
      });
    },
    [channel, user?.id, businessPlanId, isConnected]
  );

  // Função para bloquear um item para edição
  const lockItem = useCallback(
    async (itemId: string) => {
      if (!user?.id) return false;

      try {
        const { data, error } = await supabase
          .from('canvas_items')
          .update({
            locked_by: user.id,
            locked_at: new Date().toISOString(),
          })
          .eq('id', itemId)
          .select()
          .single();

        if (error) {
          console.error('Error locking item:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error locking item:', error);
        return false;
      }
    },
    [user?.id]
  );

  // Função para desbloquear um item
  const unlockItem = useCallback(
    async (itemId: string) => {
      if (!user?.id) return false;

      try {
        const { data, error } = await supabase
          .from('canvas_items')
          .update({
            locked_by: null,
            locked_at: null,
          })
          .eq('id', itemId)
          .eq('locked_by', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error unlocking item:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error unlocking item:', error);
        return false;
      }
    },
    [user?.id]
  );

  // Configurar o canal de realtime
  useEffect(() => {
    if (!businessPlanId || !user?.id) return;

    // Criar um canal específico para o canvas deste plano de negócios
    const canvasChannel = supabase.channel(
      `canvas-collaboration:${businessPlanId}`,
      {
        config: {
          presence: {
            key: user.id,
          },
        },
      }
    );

    // Configurar handlers de presença
    canvasChannel
      .on('presence', { event: 'sync' }, () => {
        const state = canvasChannel.presenceState() as RealtimePresenceState<CanvasPresenceUser>;
        setPresenceState(state);
        setOnlineUsers(Object.keys(state));
        handlers.onPresenceChanged?.(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined canvas:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left canvas:', key, leftPresences);
      })
      // Configurar handlers para mudanças nos itens do canvas
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'canvas_items',
          filter: `section_id=in.(select id from canvas_sections where business_plan_id='${businessPlanId}')`,
        },
        (payload) => {
          console.log('Canvas item created:', payload);
          handlers.onItemCreated?.(payload.new as CanvasItemEvent);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canvas_items',
          filter: `section_id=in.(select id from canvas_sections where business_plan_id='${businessPlanId}')`,
        },
        (payload) => {
          console.log('Canvas item updated:', payload);
          const newItem = payload.new as CanvasItemEvent;
          const oldItem = payload.old as CanvasItemEvent;

          // Verificar se o item foi bloqueado
          if (!oldItem.locked_by && newItem.locked_by) {
            handlers.onItemLocked?.(newItem);
          }
          // Verificar se o item foi desbloqueado
          else if (oldItem.locked_by && !newItem.locked_by) {
            handlers.onItemUnlocked?.(newItem);
          }
          // Atualização normal
          else {
            handlers.onItemUpdated?.(newItem);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'canvas_items',
          filter: `section_id=in.(select id from canvas_sections where business_plan_id='${businessPlanId}')`,
        },
        (payload) => {
          console.log('Canvas item deleted:', payload);
          handlers.onItemDeleted?.(payload.old.id);
        }
      )
      .subscribe(async (status) => {
        console.log('Canvas channel status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Registrar presença inicial
          await canvasChannel.track({
            user_id: user.id,
            business_plan_id: businessPlanId,
            online_at: new Date().toISOString(),
            cursor_position: undefined,
          });
        } else {
          setIsConnected(false);
        }
      });

    setChannel(canvasChannel);

    // Limpar ao desmontar
    return () => {
      console.log('Unsubscribing from canvas channel');
      canvasChannel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    };
  }, [businessPlanId, user?.id, handlers]);

  // Configurar liberação automática de bloqueios ao desconectar
  useEffect(() => {
    if (!user?.id) return;

    // Função para liberar todos os bloqueios do usuário atual
    const releaseAllLocks = async () => {
      try {
        const { error } = await supabase
          .from('canvas_items')
          .update({
            locked_by: null,
            locked_at: null,
          })
          .eq('locked_by', user.id);

        if (error) {
          console.error('Error releasing locks:', error);
        }
      } catch (error) {
        console.error('Error releasing locks:', error);
      }
    };

    // Adicionar event listener para quando a janela for fechada
    window.addEventListener('beforeunload', releaseAllLocks);

    // Limpar ao desmontar
    return () => {
      window.removeEventListener('beforeunload', releaseAllLocks);
      releaseAllLocks();
    };
  }, [user?.id]);

  return {
    isConnected,
    onlineUsers,
    presenceState,
    updateCursorPosition,
    lockItem,
    unlockItem,
  };
};
