
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';

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
    name: string;
    status: 'approved' | 'pending' | 'draft' | 'rejected';
    progress: number;
  }[];
}

interface ProgressDashboardProps {
  projectStats: ProjectStats;
  sectionProgress: SectionProgress[];
}

const ProgressDashboard = ({ projectStats, sectionProgress }: ProgressDashboardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

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
                <div key={section.name} className="space-y-2">
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

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Seção "Análise de Mercado" foi aprovada</p>
                <p className="text-xs text-gray-500">2 horas atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Nova votação iniciada para "Resumo Executivo"</p>
                <p className="text-xs text-gray-500">4 horas atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Maria Silva adicionou comentário em "Proposta de Valor"</p>
                <p className="text-xs text-gray-500">1 dia atrás</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
