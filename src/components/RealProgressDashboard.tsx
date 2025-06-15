
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProjectStats {
  totalSections: number;
  approvedSections: number;
  pendingSections: number;
  rejectedSections: number;
  teamMembers: number;
  overallProgress: number;
}

interface SectionProgress {
  category: string;
  sections: {
    id: string;
    name: string;
    status: 'approved' | 'voting' | 'draft' | 'rejected';
    progress: number;
  }[];
}

const RealProgressDashboard = () => {
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalSections: 0,
    approvedSections: 0,
    pendingSections: 0,
    rejectedSections: 0,
    teamMembers: 0,
    overallProgress: 0
  });
  const [sectionProgress, setSectionProgress] = useState<SectionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadProgressData();
    }
  }, [currentBusinessPlan]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Load detailed sections progress
      const { data: detailedSections, error: detailedError } = await supabase
        .from('detailed_sections')
        .select('*')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id);

      if (detailedError) {
        console.error('Error loading detailed sections:', detailedError);
        throw detailedError;
      }

      // Load canvas sections progress
      const { data: canvasSections, error: canvasError } = await supabase
        .from('canvas_sections')
        .select(`
          *,
          canvas_items(id, status)
        `)
        .eq('business_plan_id', currentBusinessPlan.business_plan_id);

      if (canvasError) {
        console.error('Error loading canvas sections:', canvasError);
        throw canvasError;
      }

      // Load team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('id')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .eq('status', 'active');

      if (teamError) {
        console.error('Error loading team members:', teamError);
        throw teamError;
      }

      // Calculate project stats
      const totalDetailedSections = detailedSections?.length || 0;
      const approvedDetailedSections = detailedSections?.filter(s => s.status === 'approved').length || 0;
      const pendingDetailedSections = detailedSections?.filter(s => s.status === 'voting').length || 0;

      const totalCanvasSections = canvasSections?.length || 0;
      const approvedCanvasSections = canvasSections?.filter(s => 
        s.canvas_items && s.canvas_items.some((item: any) => item.status === 'approved')
      ).length || 0;

      const totalSections = totalDetailedSections + totalCanvasSections;
      const approvedSections = approvedDetailedSections + approvedCanvasSections;
      const overallProgress = totalSections > 0 ? Math.round((approvedSections / totalSections) * 100) : 0;

      setProjectStats({
        totalSections,
        approvedSections,
        pendingSections: pendingDetailedSections,
        rejectedSections: detailedSections?.filter(s => s.status === 'rejected').length || 0,
        teamMembers: teamMembers?.length || 0,
        overallProgress
      });

      // Organize section progress by category
      const progressByCategory: { [key: string]: SectionProgress } = {};

      // Add canvas sections
      if (canvasSections) {
        progressByCategory['Business Model Canvas'] = {
          category: 'Business Model Canvas',
          sections: canvasSections.map(section => {
            const items = section.canvas_items || [];
            const approvedItems = items.filter((item: any) => item.status === 'approved').length;
            const totalItems = items.length;
            const progress = totalItems > 0 ? Math.round((approvedItems / totalItems) * 100) : 0;
            
            let status: 'approved' | 'voting' | 'draft' | 'rejected' = 'draft';
            if (progress === 100) status = 'approved';
            else if (items.some((item: any) => item.status === 'voting')) status = 'voting';

            return {
              id: section.id,
              name: section.title,
              status,
              progress
            };
          })
        };
      }

      // Add detailed sections by category
      if (detailedSections) {
        const categories = ['conceito', 'pesquisa', 'configuracao', 'projecoes'];
        
        categories.forEach(category => {
          const categorySections = detailedSections.filter(s => s.category === category);
          if (categorySections.length > 0) {
            const categoryName = {
              'conceito': 'Conceito',
              'pesquisa': 'Pesquisa',
              'configuracao': 'Configuração',
              'projecoes': 'Projeções'
            }[category] || category;

            progressByCategory[categoryName] = {
              category: categoryName,
              sections: categorySections.map(section => ({
                id: section.id,
                name: section.title,
                status: section.status as any,
                progress: section.progress_percentage || 0
              }))
            };
          }
        });
      }

      setSectionProgress(Object.values(progressByCategory));

    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de progresso.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      case 'voting': return <Clock className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando dados de progresso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.overallProgress}%</div>
            <Progress value={projectStats.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seções Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projectStats.approvedSections}
            </div>
            <p className="text-xs text-muted-foreground">
              de {projectStats.totalSections} seções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {projectStats.pendingSections}
            </div>
            <p className="text-xs text-muted-foreground">
              aguardando aprovação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros da Equipe</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projectStats.teamMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              colaboradores ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectionProgress.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{section.name}</span>
                    <Badge className={getStatusColor(section.status)}>
                      {getStatusIcon(section.status)}
                      <span className="ml-1 capitalize">{section.status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={section.progress} className="flex-1" />
                    <span className="text-xs text-gray-600 w-12">
                      {section.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RealProgressDashboard;
