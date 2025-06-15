
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, FileText, Vote, BarChart3, LogOut, UserPlus, Menu, X, CheckCircle } from 'lucide-react';
import CanvasEditor from '@/components/CanvasEditor';
import DetailedSectionManager from '@/components/DetailedSectionManager';
import VotingInterface from '@/components/VotingInterface';
import ProgressDashboard from '@/components/ProgressDashboard';
import TeamManagement from '@/components/TeamManagement';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime, useRealtimeCanvasItems } from '@/hooks/useRealtime';

const Index = () => {
  const { user, currentBusinessPlan, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('canvas');
  const [activeCategory, setActiveCategory] = useState('conceito');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use realtime hooks
  const { onlineUsers } = useRealtime();
  
  // Callback to refresh canvas data when items change
  const refreshCanvasData = useCallback(() => {
    console.log('Canvas data updated in real-time');
  }, []);

  useRealtimeCanvasItems(currentBusinessPlan?.business_plan_id, refreshCanvasData);

  // Mock voting sections for demonstration - these should come from database
  const votingSections = [
    {
      id: 'customer-relationships',
      title: 'Relacionamento com Clientes',
      content: 'Estabeleceremos relacionamentos próximos através de suporte personalizado, consultoria especializada e programas de fidelidade.',
      votes: { approved: 2, rejected: 1, total: 3 },
      deadline: '15/12/2024'
    }
  ];

  // Enhanced progress data - should be calculated from real data
  const projectStats = {
    totalSections: 24,
    approvedSections: 2,
    pendingSections: 3,
    rejectedSections: 0,
    teamMembers: 1,
    overallProgress: 15
  };

  const sectionProgress = [
    {
      category: 'Business Model Canvas',
      sections: [
        { name: 'Proposta de Valor', status: 'draft' as const, progress: 20 },
        { name: 'Segmentos de Clientes', status: 'draft' as const, progress: 0 },
        { name: 'Canais', status: 'draft' as const, progress: 0 },
        { name: 'Relacionamento', status: 'draft' as const, progress: 0 },
        { name: 'Fontes de Receita', status: 'draft' as const, progress: 0 },
        { name: 'Recursos-Chave', status: 'draft' as const, progress: 0 }
      ]
    },
    {
      category: 'Conceito',
      sections: [
        { name: 'Resumo Executivo', status: 'draft' as const, progress: 0 },
        { name: 'Missão e Visão', status: 'draft' as const, progress: 0 },
        { name: 'Objetivos Estratégicos', status: 'draft' as const, progress: 0 }
      ]
    }
  ];

  // Navigation and category items
  const navigationItems = [
    { id: 'canvas', label: 'Canvas', icon: <FileText className="w-4 h-4" /> },
    { id: 'detalhado', label: 'Plano Detalhado', icon: <FileText className="w-4 h-4" /> },
    { id: 'votacao', label: 'Votação', icon: <Vote className="w-4 h-4" /> },
    { id: 'progresso', label: 'Progresso', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'equipe', label: 'Equipe', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'aprovacao', label: 'Aprovação', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const categoryItems = [
    { id: 'conceito', label: 'Conceito' },
    { id: 'pesquisa', label: 'Pesquisa' },
    { id: 'configuracao', label: 'Configuração' },
    { id: 'projecoes', label: 'Projeções' }
  ];

  const handleVote = (sectionId: string, vote: 'approve' | 'reject', comment?: string) => {
    console.log('Voting:', sectionId, vote, comment);
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (!currentBusinessPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando seu workspace...</p>
        </div>
      </div>
    );
  }

  // Calculate progress from real canvas data
  const overallProgress = 15; // This should be calculated from real data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    {currentBusinessPlan.business_plans?.companies?.name || 'Business Plan Studio'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {currentBusinessPlan.business_plans?.name || 'Sistema Colaborativo de Plano de Negócios'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Online users indicator */}
              {onlineUsers.length > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{onlineUsers.length} online</span>
                </div>
              )}
              
              {/* Progress indicator */}
              <div className="text-right">
                <p className="text-xs sm:text-sm text-slate-600">Progresso</p>
                <div className="flex items-center space-x-2">
                  <div className="w-16 sm:w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">{overallProgress}%</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-1 sm:space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden sm:inline-flex border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Exportar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Desktop Navigation */}
        <nav className="mb-6 sm:mb-8 hidden lg:block">
          <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-lg p-1 border border-slate-200">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Team Management View */}
        {activeSection === 'equipe' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Gestão da Equipe</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Gerencie os membros da sua equipe, convide novos colaboradores e defina permissões.
              </p>
            </div>
            <TeamManagement />
          </div>
        )}

        {/* Canvas View */}
        {activeSection === 'canvas' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Business Model Canvas</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Desenvolva seu modelo de negócio de forma colaborativa. Cada seção pode ser editada, discutida e aprovada pela equipe.
              </p>
            </div>
            <CanvasEditor />
          </div>
        )}

        {/* Detailed Plan View */}
        {activeSection === 'detalhado' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Plano de Negócios Detalhado</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Desenvolva cada seção do seu plano de negócios com profundidade e colaboração.
              </p>
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap gap-1 sm:space-x-1 bg-white/70 backdrop-blur-sm rounded-lg p-1 border border-slate-200 mb-6">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`flex-1 min-w-0 px-3 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    activeCategory === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <DetailedSectionManager category={activeCategory} />
          </div>
        )}

        {/* Voting View */}
        {activeSection === 'votacao' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Centro de Votação</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Vote nas seções submetidas pela equipe. Sua participação é fundamental para o consenso.
              </p>
            </div>

            {votingSections.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {votingSections.map((section) => (
                  <VotingInterface
                    key={section.id}
                    section={section}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12 sm:py-16">
                  <Vote className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Nenhuma votação pendente</h3>
                  <p className="text-gray-600 text-sm sm:text-base px-4">
                    Quando a equipe submeter seções para aprovação, elas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Progress View */}
        {activeSection === 'progresso' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Dashboard de Progresso</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Acompanhe o progresso geral do projeto e o status de cada seção.
              </p>
            </div>
            <ProgressDashboard
              projectStats={projectStats}
              sectionProgress={sectionProgress}
            />
          </div>
        )}

        {/* Approval View */}
        {activeSection === 'aprovacao' && (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 sm:p-8 border border-slate-200 mx-auto max-w-lg">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Seções Aprovadas</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base">
                Esta área mostrará todas as seções finalizadas e aprovadas pela equipe.
              </p>
              <Button 
                onClick={() => setActiveSection('canvas')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Voltar ao Canvas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
