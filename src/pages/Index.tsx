
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CanvasEditor from '@/components/CanvasEditor';
import DetailedSectionManager from '@/components/DetailedSectionManager';
import VotingCenter from '@/components/VotingCenter';
import RealProgressDashboard from '@/components/RealProgressDashboard';
import TeamManagement from '@/components/TeamManagement';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';

const Index = () => {
  const [activeTab, setActiveTab] = useState('canvas');
  const { currentBusinessPlan } = useAuth();
  const { onlineUsers } = useRealtime();

  if (!currentBusinessPlan) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo!</h1>
            <p>Selecione ou crie um plano de negócios para começar.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{currentBusinessPlan.name}</h1>
            <p className="text-gray-600">{currentBusinessPlan.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{onlineUsers.length} online</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="detailed">Plano Detalhado</TabsTrigger>
            <TabsTrigger value="voting">Votação</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="approval">Aprovação</TabsTrigger>
          </TabsList>

          <TabsContent value="canvas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Model Canvas</CardTitle>
                <p className="text-gray-600">
                  Desenvolva seu modelo de negócio de forma colaborativa. Cada seção pode ser editada, discutida e aprovada pela equipe.
                </p>
              </CardHeader>
              <CardContent>
                <CanvasEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano de Negócios Detalhado</CardTitle>
                <p className="text-gray-600">
                  Desenvolva cada seção do seu plano de negócios com profundidade e colaboração. 
                  Cada seção possui métricas de progresso, comentários e sistema de aprovação.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="conceito" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="conceito">Conceito</TabsTrigger>
                    <TabsTrigger value="pesquisa">Pesquisa</TabsTrigger>
                    <TabsTrigger value="configuracao">Configuração</TabsTrigger>
                    <TabsTrigger value="projecoes">Projeções</TabsTrigger>
                  </TabsList>

                  <TabsContent value="conceito" className="mt-6">
                    <DetailedSectionManager category="conceito" />
                  </TabsContent>

                  <TabsContent value="pesquisa" className="mt-6">
                    <DetailedSectionManager category="pesquisa" />
                  </TabsContent>

                  <TabsContent value="configuracao" className="mt-6">
                    <DetailedSectionManager category="configuracao" />
                  </TabsContent>

                  <TabsContent value="projecoes" className="mt-6">
                    <DetailedSectionManager category="projecoes" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voting" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Centro de Votação</CardTitle>
                <p className="text-gray-600">
                  Vote nas seções submetidas pela equipe. Sua participação é fundamental para o consenso.
                </p>
              </CardHeader>
              <CardContent>
                <VotingCenter />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard de Progresso</CardTitle>
                <p className="text-gray-600">
                  Acompanhe o progresso geral do projeto e o status de cada seção.
                </p>
              </CardHeader>
              <CardContent>
                <RealProgressDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão da Equipe</CardTitle>
                <p className="text-gray-600">
                  Gerencie os membros da sua equipe, convite novos colaboradores e defina permissões.
                </p>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Seções Aprovadas</CardTitle>
                <p className="text-gray-600">
                  Esta área mostrará todas as seções finalizadas e aprovadas pela equipe.
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Seções Aprovadas</h3>
                  <p className="text-gray-600 mb-4">
                    Esta área mostrará todas as seções finalizadas e aprovadas pela equipe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
