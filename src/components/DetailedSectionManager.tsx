
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, MessageSquare, Vote, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DetailedSection {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'voting' | 'approved' | 'rejected';
  assigned_to?: string;
  deadline?: string;
  category: string;
  progress_percentage: number;
  dependencies?: string[];
  created_at: string;
  updated_at: string;
  section_key: string;
}

interface DetailedSectionManagerProps {
  category: string;
}

const DetailedSectionManager = ({ category }: DetailedSectionManagerProps) => {
  const [sections, setSections] = useState<DetailedSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadDetailedSections();
    }
  }, [currentBusinessPlan, category]);

  const loadDetailedSections = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('detailed_sections')
        .select('*')
        .eq('business_plan_id', currentBusinessPlan?.business_plan_id)
        .eq('category', category)
        .order('created_at');

      if (error) {
        console.error('Error loading detailed sections:', error);
        // Se não existem seções, criar as padrão
        if (error.code === 'PGRST116') {
          await createDefaultSections();
          return;
        }
        throw error;
      }

      if (!data || data.length === 0) {
        // Se não há dados, criar seções padrão
        await createDefaultSections();
        return;
      }

      setSections(data.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description || '',
        content: section.content || '',
        status: section.status as 'draft' | 'voting' | 'approved' | 'rejected',
        assigned_to: section.assigned_to,
        deadline: section.deadline ? new Date(section.deadline).toLocaleDateString('pt-BR') : undefined,
        category: section.category,
        progress_percentage: section.progress_percentage || 0,
        dependencies: section.dependencies,
        created_at: section.created_at,
        updated_at: section.updated_at,
        section_key: section.section_key
      })));
      
    } catch (error) {
      console.error('Error loading detailed sections:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as seções.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSections = async () => {
    try {
      // Chamar a função do banco para criar seções padrão
      const { error } = await supabase.rpc('create_default_detailed_sections', {
        plan_id: currentBusinessPlan?.business_plan_id
      });

      if (error) {
        console.error('Error creating default sections:', error);
        throw error;
      }

      // Recarregar as seções após criar
      await loadDetailedSections();
    } catch (error) {
      console.error('Error creating default sections:', error);
    }
  };

  const startEditing = (section: DetailedSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const saveSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('detailed_sections')
        .update({
          content: editContent,
          progress_percentage: editContent.trim() ? Math.min(100, (sections.find(s => s.id === sectionId)?.progress_percentage || 0) + 25) : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId);

      if (error) {
        console.error('Error saving section:', error);
        throw error;
      }

      // Atualizar estado local
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              content: editContent,
              progress_percentage: editContent.trim() ? Math.min(100, section.progress_percentage + 25) : 0,
              updated_at: new Date().toISOString()
            }
          : section
      ));

      setEditingSection(null);
      setEditContent('');

      toast({
        title: "Seção salva",
        description: "O conteúdo foi salvo com sucesso.",
      });
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a seção.",
        variant: "destructive"
      });
    }
  };

  const startVoting = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('detailed_sections')
        .update({ status: 'voting' })
        .eq('id', sectionId);

      if (error) {
        console.error('Error starting voting:', error);
        throw error;
      }

      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { ...section, status: 'voting' as const }
          : section
      ));

      toast({
        title: "Votação iniciada",
        description: "A seção foi enviada para votação.",
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

  const canEdit = (section: DetailedSection) => {
    if (section.dependencies && section.dependencies.length > 0) {
      const dependentSections = sections.filter(s => 
        section.dependencies!.some(dep => s.section_key === dep)
      );
      return dependentSections.every(s => s.status === 'approved' || s.progress_percentage >= 50);
    }
    return true;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando seções...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{section.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(section.status)}>
                  {section.status}
                </Badge>
                {section.assigned_to && (
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    Atribuído
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{section.progress_percentage}%</span>
              </div>
              <Progress value={section.progress_percentage} className="w-full" />
            </div>

            {section.dependencies && section.dependencies.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dependências: </span>
                {section.dependencies.join(', ')}
              </div>
            )}

            {section.deadline && (
              <div className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Prazo: </span>
                {section.deadline}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {editingSection === section.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="Desenvolva o conteúdo desta seção..."
                />
                <div className="flex space-x-2">
                  <Button onClick={() => saveSection(section.id)}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSection(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="min-h-[100px] p-4 border rounded-lg bg-gray-50">
                  {section.content || 'Clique em editar para desenvolver esta seção...'}
                </div>
                {canEdit(section) ? (
                  <Button onClick={() => startEditing(section)}>
                    Editar Seção
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Complete as dependências antes de editar esta seção.
                  </p>
                )}
              </div>
            )}

            {section.status === 'voting' && (
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-medium mb-2">Em Votação</h4>
                <p className="text-sm text-gray-600">
                  Esta seção está sendo avaliada pela equipe.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comentários (0)
              </Button>
              
              {section.status === 'draft' && section.content && canEdit(section) && (
                <Button
                  onClick={() => startVoting(section.id)}
                  variant="outline"
                  size="sm"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  Enviar para Votação
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DetailedSectionManager;
