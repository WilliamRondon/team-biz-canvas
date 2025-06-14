
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Vote, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
}

interface CanvasEditorProps {
  onUpdateSection?: (id: string, content: string) => void;
  onStartVoting?: (id: string) => void;
}

const CanvasEditor = ({ onUpdateSection, onStartVoting }: CanvasEditorProps) => {
  const [sections, setSections] = useState<CanvasSection[]>([]);
  const [items, setItems] = useState<{ [key: string]: CanvasItem[] }>({});
  const [newItemContent, setNewItemContent] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadCanvasSections();
    }
  }, [currentBusinessPlan]);

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

  const startVoting = async (itemId: string, sectionId: string) => {
    try {
      const { error } = await supabase
        .from('canvas_items')
        .update({ status: 'voting' })
        .eq('id', itemId);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a votação.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
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

  return (
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
                <div key={item.id} className="p-3 border rounded-lg">
                  <p className="text-sm mb-2">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                    {item.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startVoting(item.id, section.id)}
                      >
                        <Vote className="w-3 h-3 mr-1" />
                        Votar
                      </Button>
                    )}
                  </div>
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
  );
};

export default CanvasEditor;
