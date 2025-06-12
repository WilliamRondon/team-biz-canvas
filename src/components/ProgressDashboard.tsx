
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Users, TrendingUp, FileText } from 'lucide-react';

interface ProgressDashboardProps {
  projectStats: {
    totalSections: number;
    approvedSections: number;
    pendingSections: number;
    rejectedSections: number;
    teamMembers: number;
    overallProgress: number;
  };
  sectionProgress: Array<{
    category: string;
    sections: Array<{
      name: string;
      status: 'approved' | 'pending' | 'rejected' | 'draft';
      progress: number;
    }>;
  }>;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ projectStats, sectionProgress }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progresso Geral</p>
                <p className="text-2xl font-bold text-blue-600">{projectStats.overallProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={projectStats.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{projectStats.approvedSections}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{projectStats.pendingSections}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Equipe</p>
                <p className="text-2xl font-bold text-purple-600">{projectStats.teamMembers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sectionProgress.map((category, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-medium text-gray-900">{category.category}</h4>
                <div className="space-y-2">
                  {category.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(section.status)}
                        <span className="text-sm font-medium">{section.name}</span>
                        <Badge className={getStatusColor(section.status)}>
                          {section.status === 'approved' ? 'Aprovada' :
                           section.status === 'pending' ? 'Pendente' :
                           section.status === 'rejected' ? 'Rejeitada' : 'Rascunho'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 text-right text-sm text-gray-600">
                          {section.progress}%
                        </div>
                        <Progress value={section.progress} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
