import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeDetailedSections } from '@/hooks/useRealtimeDetailedSections';
import { useRealtimeVotingResults } from '@/hooks/useRealtimeVotingResults';

interface ProgressData {
  category: string;
  total_sections: number;
  approved_sections: number;
  progress_percentage: number;
}

interface CanvasProgress {
  id: string;
  title: string;
  progress: number;
  total_items: number;
  approved_items: number;
}

interface TeamMember {
  id: string;
  role: string;
  status: string;
  user_name?: string;
}

interface ActivityItem {
  id: string;
  type: 'section_approved' | 'voting_started' | 'comment_added';
  title: string;
  description: string;
  created_at: string;
  user_name?: string;
}

const RealProgressDashboard = () => {
  const [detailedProgress, setDetailedProgress] = useState<ProgressData[]>([]);
  const [canvasProgress, setCanvasProgress] = useState<CanvasProgress[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan } = useAuth();

  const loadProgressData = useCallback(async () => {
    if (!currentBusinessPlan?.business_plan_id) {
      console.log('No business plan found');
      return;
    }

    try {
      console.log('Loading progress data for business plan:', currentBusinessPlan.business_plan_id);
      setLoading(true);

      // Load detailed sections progress
      const { data: detailedData, error: detailedError } = await supabase
        .rpc('calculate_detailed_section_progress', {
          business_plan_id_param: currentBusinessPlan.business_plan_id
        });

      if (detailedError) {
        console.error('Error loading detailed progress:', detailedError);
      } else {
        console.log('Detailed progress data:', detailedData);
        setDetailedProgress(detailedData || []);
      }

      // Load canvas progress
      const { data: canvasData, error: canvasError } = await supabase
        .rpc('get_business_plan_progress', {
          plan_id: currentBusinessPlan.business_plan_id
        });

      if (canvasError) {
        console.error('Error loading canvas progress:', canvasError);
      } else if (canvasData && canvasData.length > 0) {
        console.log('Canvas progress data:', canvasData[0]);
        const progressData = canvasData[0];
        setOverallProgress(progressData.overall_percentage || 0);
        
        // Handle the sections data safely with proper type casting
        if (progressData.sections && Array.isArray(progressData.sections)) {
          try {
            // Parse and validate each section object
            const sectionsArray = progressData.sections
              .filter((section: any) => section && typeof section === 'object')
              .map((section: any) => ({
                id: section.id || '',
                title: section.title || '',
                progress: section.progress || 0,
                total_items: section.total_items || 0,
                approved_items: section.approved_items || 0
              })) as CanvasProgress[];
            setCanvasProgress(sectionsArray);
          } catch (e) {
            console.error('Error parsing sections data:', e);
            setCanvasProgress([]);
          }
        } else {
          setCanvasProgress([]);
        }
      }

      // Load team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('id, role, status, user_id')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .eq('status', 'active');

      if (teamError) {
        console.error('Error loading team members:', teamError);
      } else if (teamData) {
        // Get user profiles for team members
        const userIds = teamData.map(member => member.user_id).filter(Boolean);
        let userProfiles: any[] = [];
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            userProfiles = profilesData;
          }
        }

        const mappedTeamMembers = teamData.map(member => {
          const userProfile = userProfiles.find(profile => profile.id === member.user_id);
          return {
            id: member.id,
            role: member.role,
            status: member.status,
            user_name: userProfile?.full_name || 'Usuário desconhecido'
          };
        });

        setTeamMembers(mappedTeamMembers);
      }

      // Load recent activity from real data
      await loadRecentActivity();

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentBusinessPlan?.business_plan_id]);

  const loadRecentActivity = async () => {
    if (!currentBusinessPlan?.business_plan_id) return;

    try {
      const activityItems: ActivityItem[] = [];

      // Get recent voting sessions
      const { data: votingSessions, error: votingError } = await supabase
        .from('voting_sessions')
        .select('id, title, created_at, status, created_by, user_profiles(full_name)')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!votingError && votingSessions) {
        votingSessions.forEach(session => {
          if (session.status === 'completed') {
            activityItems.push({
              id: `voting-completed-${session.id}`,
              type: 'section_approved',
              title: 'Votação finalizada',
              description: `Votação para "${session.title}" foi concluída`,
              created_at: session.created_at,
              user_name: (session as any).user_profiles?.full_name
            });
          } else {
            activityItems.push({
              id: `voting-${session.id}`,
              type: 'voting_started',
              title: 'Nova votação iniciada',
              description: `Votação iniciada para "${session.title}"`,
              created_at: session.created_at,
              user_name: (session as any).user_profiles?.full_name
            });
          }
        });
      }

      // Get recently approved sections
      const { data: approvedSections, error: approvedError } = await supabase
        .from('detailed_sections')
        .select('id, title, updated_at')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(2);

      if (!approvedError && approvedSections) {
        approvedSections.forEach(section => {
          activityItems.push({
            id: `approved-${section.id}`,
            type: 'section_approved',
            title: 'Seção aprovada',
            description: `Seção "${section.title}" foi aprovada`,
            created_at: section.updated_at
          });
        });
      }

      // Get recently approved canvas items
      const { data: approvedItems, error: itemsError } = await supabase
        .from('canvas_items')
        .select('id, content, updated_at, canvas_sections(title)')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(2);

      if (!itemsError && approvedItems) {
        approvedItems.forEach(item => {
          activityItems.push({
            id: `canvas-approved-${item.id}`,
            type: 'section_approved',
            title: 'Item do Canvas aprovado',
            description: `Item "${item.content}" em "${(item as any).canvas_sections?.title}" foi aprovado`,
            created_at: item.updated_at
          });
        });
      }

      // Sort by date and take the most recent
      activityItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activityItems.slice(0, 5));

    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  // Use realtime hooks with proper callback
  useRealtimeDetailedSections(currentBusinessPlan?.business_plan_id || '', loadProgressData);
  useRealtimeVotingResults(currentBusinessPlan?.business_plan_id || '', loadProgressData);

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      console.log('Initial load for business plan:', currentBusinessPlan.business_plan_id);
      loadProgressData();
    }
  }, [currentBusinessPlan?.business_plan_id, loadProgressData]);

  const calculateOverallDetailedProgress = () => {
    if (detailedProgress.length === 0) return 0;
    return Math.round(
      detailedProgress.reduce((sum, cat) => sum + cat.progress_percentage, 0) / detailedProgress.length
    );
  };

  const getTotalApprovedSections = () => {
    return detailedProgress.reduce((sum, cat) => sum + cat.approved_sections, 0);
  };

  const getTotalSections = () => {
    return detailedProgress.reduce((sum, cat) => sum + cat.total_sections, 0);
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return { variant: 'default', text: 'Aprovado', color: 'bg-green-100 text-green-800' };
    if (progress >= 75) return { variant: 'secondary', text: 'Em Andamento', color: 'bg-blue-100 text-blue-800' };
    if (progress >= 25) return { variant: 'outline', text: 'Iniciado', color: 'bg-yellow-100 text-yellow-800' };
    return { variant: 'outline', text: 'Rascunho', color: 'bg-gray-100 text-gray-800' };
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando progresso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.max(calculateOverallDetailedProgress(), overallProgress)}%</p>
                <p className="text-sm text-gray-600">Progresso Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalApprovedSections()}</p>
                <p className="text-sm text-gray-600">de {getTotalSections()} seções</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalSections() - getTotalApprovedSections()}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-gray-600">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Model Canvas */}
      {canvasProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Model Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {canvasProgress.map((section) => {
                const status = getStatusBadge(section.progress);
                return (
                  <div key={section.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{section.title}</span>
                      <Badge className={status.color}>{status.text}</Badge>
                    </div>
                    <Progress value={section.progress} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {section.approved_items}/{section.total_items} itens aprovados
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {detailedProgress.map((category) => {
          const status = getStatusBadge(category.progress_percentage);
          return (
            <Card key={category.category}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">{category.category}</CardTitle>
                  <Badge className={status.color}>{status.text}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{category.progress_percentage}%</span>
                  </div>
                  <Progress value={category.progress_percentage} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {category.approved_sections} de {category.total_sections} seções aprovadas
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'section_approved' ? 'bg-green-500' : 
                    activity.type === 'voting_started' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealProgressDashboard;
