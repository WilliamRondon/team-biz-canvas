
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen bg-gray-50">
        {/* Header Superior */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">💡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentBusinessPlan.name}</h1>
                <p className="text-sm text-gray-600">{currentBusinessPlan.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progresso</div>
                <div className="text-lg font-semibold text-gray-900">11%</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{onlineUsers.length} online</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Exportar
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white rounded-lg p-1 shadow-sm">
              <TabsTrigger value="canvas" className="flex items-center space-x-2">
                <span>📋</span>
                <span>Canvas</span>
              </TabsTrigger>
              <TabsTrigger value="detailed" className="flex items-center space-x-2">
                <span>📊</span>
                <span>Plano Detalhado</span>
              </TabsTrigger>
              <TabsTrigger value="voting" className="flex items-center space-x-2">
                <span>🗳️</span>
                <span>Votação</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2">
                <span>📈</span>
                <span>Progresso</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-2">
                <span>👥</span>
                <span>Equipe</span>
              </TabsTrigger>
              <TabsTrigger value="approval" className="flex items-center space-x-2">
                <span>✅</span>
                <span>Aprovação</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="mt-6">
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Business Model Canvas</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Desenvolva seu modelo de negócio de forma colaborativa. Cada seção pode ser editada, 
                    discutida e aprovada pela equipe.
                  </p>
                </CardHeader>
                <CardContent>
                  <CanvasEditor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed" className="mt-6">
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Plano de Negócios Detalhado</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Desenvolva cada seção do seu plano de negócios com profundidade e colaboração. 
                    Cada seção possui métricas de progresso, comentários e sistema de aprovação.
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="conceito" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-100">
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
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Centro de Votação</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Vote nas seções submetidas pela equipe. Sua participação é fundamental para o consenso.
                  </p>
                </CardHeader>
                <CardContent>
                  <VotingCenter />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Dashboard de Progresso</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Acompanhe o progresso geral do projeto e o status de cada seção.
                  </p>
                </CardHeader>
                <CardContent>
                  <RealProgressDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Gestão da Equipe</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Gerencie os membros da sua equipe, convide novos colaboradores e defina permissões.
                  </p>
                </CardHeader>
                <CardContent>
                  <TeamManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approval" className="mt-6">
              <Card className="shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900">Seções Aprovadas</CardTitle>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Esta área mostrará todas as seções finalizadas e aprovadas pela equipe.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">Seções Aprovadas</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Esta área mostrará todas as seções finalizadas e aprovadas pela equipe.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('canvas')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Voltar ao Canvas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
