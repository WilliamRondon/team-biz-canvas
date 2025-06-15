
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
      
      // For now, we'll create default sections if they don't exist
      // This should be replaced with actual database queries when the detailed_sections table exists
      const defaultSections = getDefaultSectionsForCategory(category);
      setSections(defaultSections);
      
    } catch (error) {
      console.error('Error loading detailed sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSectionsForCategory = (category: string): DetailedSection[] => {
    const sections: { [key: string]: DetailedSection[] } = {
      conceito: [
        {
          id: 'resumo-executivo',
          title: 'Resumo Executivo',
          description: 'Visão geral do negócio',
          content: '',
          status: 'draft',
          assigned_to: user?.id,
          deadline: '15/12/2024',
          category: 'conceito',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'missao-visao',
          title: 'Missão, Visão e Valores',
          description: 'Definição dos princípios da empresa',
          content: '',
          status: 'draft',
          category: 'conceito',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'objetivos-estrategicos',
          title: 'Objetivos Estratégicos',
          description: 'Metas e objetivos de longo prazo',
          content: '',
          status: 'draft',
          category: 'conceito',
          progress_percentage: 0,
          dependencies: ['missao-visao'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      pesquisa: [
        {
          id: 'analise-mercado',
          title: 'Análise de Mercado',
          description: 'Estudo do mercado-alvo',
          content: '',
          status: 'draft',
          category: 'pesquisa',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'personas',
          title: 'Personas de Cliente',
          description: 'Perfil dos clientes ideais',
          content: '',
          status: 'draft',
          category: 'pesquisa',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'analise-concorrencia',
          title: 'Análise da Concorrência',
          description: 'Estudo dos concorrentes',
          content: '',
          status: 'draft',
          category: 'pesquisa',
          progress_percentage: 0,
          dependencies: ['analise-mercado'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      configuracao: [
        {
          id: 'estrutura-organizacional',
          title: 'Estrutura Organizacional',
          description: 'Organização da empresa',
          content: '',
          status: 'draft',
          category: 'configuracao',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'plano-operacional',
          title: 'Plano Operacional',
          description: 'Operações do dia-a-dia',
          content: '',
          status: 'draft',
          category: 'configuracao',
          progress_percentage: 0,
          dependencies: ['estrutura-organizacional'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      projecoes: [
        {
          id: 'analise-financeira',
          title: 'Análise Financeira',
          description: 'Projeções financeiras',
          content: '',
          status: 'draft',
          category: 'projecoes',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'analise-riscos',
          title: 'Análise de Riscos',
          description: 'Identificação e mitigação de riscos',
          content: '',
          status: 'draft',
          category: 'projecoes',
          progress_percentage: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    return sections[category] || [];
  };

  const startEditing = (section: DetailedSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const saveSection = async (sectionId: string) => {
    try {
      // Update local state for now
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
    if (section.dependencies) {
      const dependentSections = sections.filter(s => 
        section.dependencies!.some(dep => dep.includes(s.title))
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
