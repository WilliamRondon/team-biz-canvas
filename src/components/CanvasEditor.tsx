
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, MessageSquare, Vote, CheckCircle, Lock, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeCanvas } from '@/hooks/useRealtimeCanvas';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CanvasSection {
  id: string;
  title: string;
  description: string;
  section_type: string;
  sort_order: number;
}

interface CanvasItem {
  id: string;
  content: string;
  status: string;
  created_by: string;
  section_id: string;
  created_at: string;
  locked_by: string | null;
  locked_at: string | null;
}

interface UserPresence {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cursor_position?: { x: number; y: number };
  last_active: string;
}

const CanvasEditor = () => {
  const [sections, setSections] = useState<CanvasSection[]>([]);
  const [items, setItems] = useState<{ [key: string]: CanvasItem[] }>({});
  const [newItemContent, setNewItemContent] = useState<{ [key: string]: string }>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Integração com o hook de realtime
  const {
    onlineUsers,
    lockItem,
    unlockItem,
    updateCursorPosition,
    isConnected
  } = useRealtimeCanvas(currentBusinessPlan?.business_plan_id || '', {
    onItemCreated: (newItem) => {
      setItems(prev => ({
        ...prev,
        [newItem.section_id || '']: [
          ...(prev[newItem.section_id || ''] || []),
          newItem
        ]
      }));
      
      toast({
        title: "Novo item adicionado",
        description: "Um novo item foi adicionado à seção.",
      });
    },
    onItemUpdated: (updatedItem) => {
      setItems(prev => ({
        ...prev,
        [updatedItem.section_id || '']: prev[updatedItem.section_id || '']?.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ) || []
      }));
    },
    onItemDeleted: (deletedItemId) => {
      setItems(prev => {
        const newItems = { ...prev };
        Object.keys(newItems).forEach(sectionId => {
          newItems[sectionId] = newItems[sectionId].filter(item => item.id !== deletedItemId);
        });
        return newItems;
      });
      
      toast({
        title: "Item removido",
        description: "Um item foi removido da seção.",
      });
    }
  });

  // Funções auxiliares para verificar bloqueios
  const isItemLocked = (itemId: string) => {
    const allItems = Object.values(items).flat();
    const item = allItems.find(i => i.id === itemId);
    return item?.locked_by !== null;
  };

  const isItemLockedByCurrentUser = (itemId: string) => {
    const allItems = Object.values(items).flat();
    const item = allItems.find(i => i.id === itemId);
    return item?.locked_by === user?.id;
  };

  const getItemLocker = (itemId: string) => {
    const allItems = Object.values(items).flat();
    const item = allItems.find(i => i.id === itemId);
    if (!item?.locked_by) return null;
    
    // Retornar dados básicos do usuário (em um caso real, você buscaria do banco)
    return {
      full_name: 'Usuário',
      avatar_url: null
    };
  };

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadCanvasSections();
    }
    
    // Configurar o rastreamento de posição do cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (editorRef.current && currentBusinessPlan?.business_plan_id) {
        const rect = editorRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        updateCursorPosition({ x, y });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentBusinessPlan, updateCursorPosition]);

  const loadCanvasSections = async () => {
    try {
      setLoading(true);
      
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('canvas_sections')
        .select('*')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .order('sort_order');

      if (sectionsError) {
        console.error('Error loading sections:', sectionsError);
        return;
      }

      setSections(sectionsData || []);

      // Load items for each section
      const itemsMap: { [key: string]: CanvasItem[] } = {};
      
      for (const section of sectionsData || []) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('canvas_items')
          .select('*')
          .eq('section_id', section.id)
          .order('created_at');

        if (!itemsError && itemsData) {
          itemsMap[section.id] = itemsData;
        }
      }
      
      setItems(itemsMap);
    } catch (error) {
      console.error('Error loading canvas data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (sectionId: string) => {
    const content = newItemContent[sectionId];
    if (!content?.trim()) return;

    try {
      const { data, error } = await supabase
        .from('canvas_items')
        .insert({
          section_id: sectionId,
          content: content.trim(),
          created_by: user?.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o item.",
          variant: "destructive"
        });
        return;
      }

      setItems(prev => ({
        ...prev,
        [sectionId]: [...(prev[sectionId] || []), data]
      }));

      setNewItemContent(prev => ({
        ...prev,
        [sectionId]: ''
      }));

      toast({
        title: "Item adicionado",
        description: "O item foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };
  
  const startEditingItem = async (item: CanvasItem) => {
    const locked = await lockItem(item.id);
    
    if (!locked) {
      toast({
        title: "Item bloqueado",
        description: "Este item está sendo editado por outro usuário.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingItem(item.id);
    setEditContent(item.content);
  };
  
  const saveItemEdit = async (item: CanvasItem) => {
    if (!editingItem) return;
    
    try {
      const { error } = await supabase
        .from('canvas_items')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive"
        });
        return;
      }
      
      await unlockItem(item.id);
      
      setEditingItem(null);
      setEditContent('');
      
      toast({
        title: "Item atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };
  
  const cancelItemEdit = async (itemId: string) => {
    await unlockItem(itemId);
    setEditingItem(null);
    setEditContent('');
  };

  const startVoting = async (itemId: string, sectionId: string) => {
    try {
      const { data: sessionId, error } = await supabase
        .rpc('create_voting_session_from_canvas_item', {
          item_id_param: itemId
        });

      if (error) {
        console.error('Error starting voting:', error);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a votação.",
          variant: "destructive"
        });
        return;
      }

      setItems(prev => ({
        ...prev,
        [sectionId]: prev[sectionId]?.map(item => 
          item.id === itemId ? { ...item, status: 'voting' } : item
        ) || []
      }));

      toast({
        title: "Votação iniciada",
        description: "O item foi enviado para votação.",
      });
    } catch (error) {
      console.error('Error starting voting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a votação.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'voting': return <Vote className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando canvas...</p>
      </div>
    );
  }

  if (!currentBusinessPlan) {
    return (
      <div className="text-center py-8">
        <p>Erro: Plano de negócios não encontrado.</p>
      </div>
    );
  }

  // Componente para exibir usuários online
  const PresenceBar = () => (
    <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium">Usuários online:</span>
      <div className="flex -space-x-2">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((userId) => (
            <TooltipProvider key={userId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Usuário online</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <span className="text-sm text-gray-500">Nenhum usuário online</span>
        )}
      </div>
      {isConnected && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600">Conectado</span>
        </div>
      )}
    </div>
  );

  return (
    <div ref={editorRef} className="space-y-6">
      {/* Barra de presença */}
      <PresenceBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {section.title}
                <Badge variant="outline">
                  {items[section.id]?.length || 0}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">{section.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de items existentes */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {items[section.id]?.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 border rounded-lg ${isItemLocked(item.id) && !isItemLockedByCurrentUser(item.id) ? 'bg-gray-50 border-amber-300' : ''}`}
                  >
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px] border-blue-300 focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => cancelItemEdit(item.id)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveItemEdit(item)}
                            disabled={!editContent.trim() || editContent.trim() === item.content}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mb-2">{item.content}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1 capitalize">{item.status}</span>
                            </Badge>
                            
                            {/* Indicador de bloqueio */}
                            {isItemLocked(item.id) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Lock className="w-3 h-3 text-amber-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Item sendo editado</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            {item.status === 'draft' && !isItemLocked(item.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingItem(item)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            )}
                            
                            {item.status === 'draft' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startVoting(item.id, section.id)}
                                disabled={isItemLocked(item.id) && !isItemLockedByCurrentUser(item.id)}
                              >
                                <Vote className="w-3 h-3 mr-1" />
                                Votar
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar novo item */}
              <div className="space-y-2 border-t pt-4">
                <Textarea
                  placeholder="Adicione um novo item para esta seção..."
                  value={newItemContent[section.id] || ''}
                  onChange={(e) => setNewItemContent(prev => ({
                    ...prev,
                    [section.id]: e.target.value
                  }))}
                  className="min-h-[80px]"
                />
                <Button 
                  onClick={() => addItem(section.id)}
                  className="w-full"
                  disabled={!newItemContent[section.id]?.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CanvasEditor;
