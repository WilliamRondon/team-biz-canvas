
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRealtime = () => {
  const { currentBusinessPlan } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!currentBusinessPlan?.business_plan_id) return;

    const channel = supabase.channel(`business_plan_${currentBusinessPlan.business_plan_id}`);

    // Track user presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
        console.log('Online users:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentBusinessPlan.user_id,
            business_plan_id: currentBusinessPlan.business_plan_id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [currentBusinessPlan?.business_plan_id]);

  return {
    onlineUsers
  };
};

export const useRealtimeCanvasItems = (businessPlanId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!businessPlanId) return;

    const channel = supabase
      .channel('canvas_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'canvas_items',
        },
        (payload) => {
          console.log('Canvas items changed:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessPlanId, onUpdate]);
};

export const useRealtimeComments = (itemId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!itemId) return;

    const channel = supabase
      .channel('comments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log('Comments changed:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, onUpdate]);
};

export const useRealtimeVotes = (itemId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!itemId) return;

    const channel = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'item_votes',
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log('Votes changed:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, onUpdate]);
};
