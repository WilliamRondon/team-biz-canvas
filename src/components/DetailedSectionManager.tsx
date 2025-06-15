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
import { useRealtimeDetailedSections } from '@/hooks/useRealtimeDetailedSections';

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
  assigned_user_name?: string;
}

interface DetailedSectionManagerProps {
  category: string;
}

const DetailedSectionManager = ({ category }: DetailedSectionManagerProps) => {
  const [sections, setSections] = useState<DetailedSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();

  const loadDetailedSections = async () => {
    try {
      setLoading(true);
      
      if (!currentBusinessPlan?.business_plan_id) {
        console.log('No business plan found');
        setLoading(false);
        return;
      }

      // First, get the sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('detailed_sections')
        .select('*')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .eq('category', category)
        .order('created_at');

      if (sectionsError) {
        console.error('Error loading detailed sections:', sectionsError);
        
        // If no sections exist, create default ones
        if (sectionsError.code === 'PGRST116' || (sectionsData && sectionsData.length === 0)) {
          console.log('Creating default sections...');
          await createDefaultSections();
          return;
        }
        throw sectionsError;
      }

      if (!sectionsData || sectionsData.length === 0) {
        console.log('No sections found, creating default ones...');
        await createDefaultSections();
        return;
      }

      console.log('Loaded detailed sections:', sectionsData);

      // Get user profiles for assigned users
      const assignedUserIds = sectionsData
        .filter(section => section.assigned_to)
        .map(section => section.assigned_to);

      let userProfiles: any[] = [];
      if (assignedUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', assignedUserIds);

        if (!profilesError && profilesData) {
          userProfiles = profilesData;
        }
      }

      const mappedSections = sectionsData.map(section => {
        const assignedUser = userProfiles.find(profile => profile.id === section.assigned_to);
        
        return {
          id: section.id,
          title: section.title,
          description: section.description || '',
          content: section.content || '',
          status: section.status as 'draft' | 'voting' | 'approved' | 'rejected',
          assigned_to: section.assigned_to,
          assigned_user_name: assignedUser?.full_name || undefined,
          deadline: section.deadline ? new Date(section.deadline).toLocaleDateString('pt-BR') : undefined,
          category: section.category,
          progress_percentage: section.progress_percentage || 0,
          dependencies: section.dependencies,
          created_at: section.created_at,
          updated_at: section.updated_at,
          section_key: section.section_key
        };
      });

      setSections(mappedSections);
      
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
      console.log('Creating default sections for business plan:', currentBusinessPlan?.business_plan_id);
      
      const { error } = await supabase.rpc('create_default_detailed_sections', {
        plan_id: currentBusinessPlan?.business_plan_id
      });

      if (error) {
        console.error('Error creating default sections:', error);
        throw error;
      }

      console.log('Default sections created successfully');
      // Reload sections after creating
      setTimeout(() => loadDetailedSections(), 1000);
    } catch (error) {
      console.error('Error creating default sections:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar as seções padrão.",
        variant: "destructive"
      });
    }
  };

  // Use realtime for updates
  useRealtimeDetailedSections(currentBusinessPlan?.business_plan_id || '', loadDetailedSections);

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadDetailedSections();
    }
  }, [currentBusinessPlan, category]);

  const startEditing = (section: DetailedSection) => {
    setEditingSection(section.id);
    setEditContent(section.content);
  };

  const saveSection = async (sectionId: string) => {
    try {
      const currentSection = sections.find(s => s.id === sectionId);
      if (!currentSection) return;

      // Calculate progress based on content
      const newProgress = editContent.trim() ? Math.min(100, Math.max(25, Math.floor(editContent.length / 50) * 25)) : 0;

      const { error } = await supabase
        .from('detailed_sections')
        .update({
          content: editContent,
          progress_percentage: newProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId);

      if (error) {
        console.error('Error saving section:', error);
        throw error;
      }

      // Update local state
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              content: editContent,
              progress_percentage: newProgress,
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
      setVotingLoading(sectionId);
      
      console.log('Starting voting for section:', sectionId);

      // Create voting session using the database function
      const { data: votingSessionId, error: votingError } = await supabase
        .rpc('create_voting_session_from_section', {
          section_id_param: sectionId
        });

      if (votingError) {
        console.error('Error creating voting session:', votingError);
        throw votingError;
      }

      console.log('Voting session created:', votingSessionId);

      // Update local state immediately
      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { ...section, status: 'voting' as const }
          : section
      ));

      toast({
        title: "Votação iniciada",
        description: "A seção foi enviada para votação.",
      });

      // Reload sections to get updated data
      setTimeout(() => loadDetailedSections(), 1000);
      
    } catch (error) {
      console.error('Error starting voting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a votação.",
        variant: "destructive"
      });
    } finally {
      setVotingLoading(null);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'voting': return 'Em Votação';
      case 'rejected': return 'Rejeitado';
      default: return 'Rascunho';
    }
  };

  const canEdit = (section: DetailedSection) => {
    if (!section.dependencies || section.dependencies.length === 0) {
      return true;
    }

    // Check if all dependencies are approved or have progress >= 50%
    const dependentSections = sections.filter(s => 
      section.dependencies!.includes(s.section_key)
    );
    
    return dependentSections.every(s => s.status === 'approved' || s.progress_percentage >= 50);
  };

  const getDependencyStatus = (section: DetailedSection) => {
    if (!section.dependencies || section.dependencies.length === 0) {
      return null;
    }

    const dependentSections = sections.filter(s => 
      section.dependencies!.includes(s.section_key)
    );

    const completedDeps = dependentSections.filter(s => 
      s.status === 'approved' || s.progress_percentage >= 50
    );

    return {
      completed: completedDeps.length,
      total: dependentSections.length,
      canEdit: completedDeps.length === dependentSections.length
    };
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando seções...</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Nenhuma seção encontrada para a categoria "{category}"</p>
        <Button onClick={createDefaultSections}>
          Criar Seções Padrão
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const depStatus = getDependencyStatus(section);
        const canEditSection = canEdit(section);

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(section.status)}>
                    {getStatusText(section.status)}
                  </Badge>
                  {section.assigned_user_name && (
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {section.assigned_user_name}
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
                  <span className={depStatus?.canEdit ? 'text-green-600' : 'text-orange-600'}>
                    {section.dependencies.join(', ')}
                    {depStatus && ` (${depStatus.completed}/${depStatus.total} completas)`}
                  </span>
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
                  {canEditSection ? (
                    <Button onClick={() => startEditing(section)}>
                      Editar Seção
                    </Button>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      Complete as dependências antes de editar esta seção.
                    </div>
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
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comentários (0)
                </Button>
                
                {section.status === 'draft' && section.content && canEditSection && (
                  <Button
                    onClick={() => startVoting(section.id)}
                    variant="outline"
                    size="sm"
                    disabled={votingLoading === section.id}
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    {votingLoading === section.id ? 'Enviando...' : 'Enviar para Votação'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DetailedSectionManager;
