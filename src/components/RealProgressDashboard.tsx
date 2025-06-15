
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

const RealProgressDashboard = () => {
  const [detailedProgress, setDetailedProgress] = useState<ProgressData[]>([]);
  const [canvasProgress, setCanvasProgress] = useState<CanvasProgress[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan } = useAuth();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadProgressData();
    }
  }, [currentBusinessPlan]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Load detailed sections progress
      const { data: detailedData, error: detailedError } = await supabase
        .rpc('calculate_detailed_section_progress', {
          business_plan_id_param: currentBusinessPlan?.business_plan_id
        });

      if (detailedError) {
        console.error('Error loading detailed progress:', detailedError);
      } else {
        setDetailedProgress(detailedData || []);
      }

      // Load canvas progress
      const { data: canvasData, error: canvasError } = await supabase
        .rpc('get_business_plan_progress', {
          plan_id: currentBusinessPlan?.business_plan_id
        });

      if (canvasError) {
        console.error('Error loading canvas progress:', canvasError);
      } else if (canvasData && canvasData.length > 0) {
        const progressData = canvasData[0];
        setOverallProgress(progressData.overall_percentage || 0);
        
        // Handle the sections data safely
        if (progressData.sections && typeof progressData.sections === 'object') {
          try {
            const sectionsArray = Array.isArray(progressData.sections) 
              ? progressData.sections 
              : [];
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
        .eq('business_plan_id', currentBusinessPlan?.business_plan_id)
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

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-2xl font-bold">{calculateOverallDetailedProgress()}%</p>
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
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Dados carregados do banco de dados em tempo real</span>
              <span className="text-xs text-gray-500">agora</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Sistema de progresso conectado ao Supabase</span>
              <span className="text-xs text-gray-500">agora</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Separação por empresa implementada</span>
              <span className="text-xs text-gray-500">agora</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealProgressDashboard;
