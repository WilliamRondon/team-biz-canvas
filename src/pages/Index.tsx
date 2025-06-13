
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Users, Target, Settings, DollarSign, TrendingUp, FileText, CheckCircle, Vote, BarChart3, LogOut, UserPlus, Menu, X } from 'lucide-react';
import CanvasEditor from '@/components/CanvasEditor';
import SectionEditor from '@/components/SectionEditor';
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
    // This will be called when canvas items change in real-time
    console.log('Canvas data updated in real-time');
    // Force re-render or refresh data logic here
  }, []);

  useRealtimeCanvasItems(currentBusinessPlan?.business_plan_id, refreshCanvasData);

  // Canvas sections data
  const [canvasSections, setCanvasSections] = useState([
    {
      id: 'key-partners',
      title: 'Parceiros-Chave',
      icon: <Users className="w-5 h-5" />,
      description: 'Quem são os seus principais parceiros e fornecedores?',
      color: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'key-activities',
      title: 'Atividades-Chave',
      icon: <Settings className="w-5 h-5" />,
      description: 'Quais são as atividades mais importantes para o sucesso do seu negócio?',
      color: 'bg-gradient-to-br from-purple-50 to-blue-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'key-resources',
      title: 'Recursos-Chave',
      icon: <Target className="w-5 h-5" />,
      description: 'Quais recursos são essenciais para seu modelo de negócio?',
      color: 'bg-gradient-to-br from-green-50 to-emerald-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'value-proposition',
      title: 'Proposta de Valor',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Qual valor único você oferece aos seus clientes?',
      color: 'bg-gradient-to-br from-yellow-50 to-orange-100',
      content: '',
      status: 'approved' as const,
      votes: { approved: 5, rejected: 0 },
      comments: 3
    },
    {
      id: 'customer-relationships',
      title: 'Relacionamento com Clientes',
      icon: <Users className="w-5 h-5" />,
      description: 'Como você se relaciona com seus clientes?',
      color: 'bg-gradient-to-br from-pink-50 to-rose-100',
      content: '',
      status: 'voting' as const,
      votes: { approved: 2, rejected: 1 },
      comments: 1
    },
    {
      id: 'channels',
      title: 'Canais',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Como você alcança e entrega valor aos seus clientes?',
      color: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'customer-segments',
      title: 'Segmentos de Clientes',
      icon: <Target className="w-5 h-5" />,
      description: 'Quem são seus clientes mais importantes?',
      color: 'bg-gradient-to-br from-violet-50 to-purple-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'cost-structure',
      title: 'Estrutura de Custos',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Quais são os custos mais importantes do seu modelo?',
      color: 'bg-gradient-to-br from-red-50 to-pink-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    },
    {
      id: 'revenue-streams',
      title: 'Fontes de Receita',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Como você gera receita com cada segmento?',
      color: 'bg-gradient-to-br from-emerald-50 to-green-100',
      content: '',
      status: 'draft' as const,
      votes: { approved: 0, rejected: 0 },
      comments: 0
    }
  ]);

  const detailedSections = {
    conceito: [
      {
        id: 'resumo-executivo',
        title: 'Resumo Executivo',
        content: 'Nossa empresa desenvolve soluções inovadoras para o mercado B2B...',
        votes: { approved: 4, rejected: 1, total: 5 },
        comments: [
          {
            id: 'c1',
            author: 'Maria Silva',
            content: 'Excelente proposta, mas seria interessante adicionar mais detalhes sobre o ROI esperado.',
            timestamp: '2 horas atrás',
            likes: 3,
            isResolved: false
          }
        ],
        status: 'voting' as const,
        assignedTo: 'João Santos',
        deadline: '15/12/2024',
        completionPercentage: 75
      },
      {
        id: 'missao-visao',
        title: 'Missão, Visão e Valores',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        assignedTo: 'Ana Costa',
        deadline: '10/12/2024',
        completionPercentage: 25
      },
      {
        id: 'objetivos-estrategicos',
        title: 'Objetivos Estratégicos',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0,
        dependencies: ['Missão, Visão e Valores']
      },
      {
        id: 'modelo-negocio',
        title: 'Modelo de Negócio',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0,
        dependencies: ['Business Model Canvas']
      }
    ],
    pesquisa: [
      {
        id: 'analise-mercado',
        title: 'Análise de Mercado',
        content: 'O mercado brasileiro de tecnologia tem crescido...',
        votes: { approved: 3, rejected: 0, total: 3 },
        comments: [
          {
            id: 'c2',
            author: 'Pedro Oliveira',
            content: 'Dados muito consistentes. Sugiro incluir análise de sazonalidade.',
            timestamp: '1 dia atrás',
            likes: 2,
            isResolved: true
          }
        ],
        status: 'approved' as const,
        assignedTo: 'Carlos Pereira',
        completionPercentage: 100
      },
      {
        id: 'personas',
        title: 'Personas de Cliente',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        assignedTo: 'Luiza Ferreira',
        deadline: '18/12/2024',
        completionPercentage: 40
      },
      {
        id: 'analise-concorrencia',
        title: 'Análise da Concorrência',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 30,
        dependencies: ['Análise de Mercado']
      },
      {
        id: 'tendencias-mercado',
        title: 'Tendências de Mercado',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0
      }
    ],
    configuracao: [
      {
        id: 'estrutura-organizacional',
        title: 'Estrutura Organizacional',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        assignedTo: 'Roberto Lima',
        deadline: '20/12/2024',
        completionPercentage: 20
      },
      {
        id: 'plano-operacional',
        title: 'Plano Operacional',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0,
        dependencies: ['Estrutura Organizacional']
      },
      {
        id: 'recursos-humanos',
        title: 'Recursos Humanos',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0
      },
      {
        id: 'tecnologia-sistemas',
        title: 'Tecnologia e Sistemas',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0
      },
      {
        id: 'localizacao-infraestrutura',
        title: 'Localização e Infraestrutura',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0
      }
    ],
    projecoes: [
      {
        id: 'analise-financeira',
        title: 'Análise Financeira',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        assignedTo: 'Fernanda Rodrigues',
        deadline: '25/12/2024',
        completionPercentage: 15
      },
      {
        id: 'projecoes-receita',
        title: 'Projeções de Receita',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0,
        dependencies: ['Análise de Mercado', 'Personas de Cliente']
      },
      {
        id: 'analise-riscos',
        title: 'Análise de Riscos',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 10
      },
      {
        id: 'plano-investimentos',
        title: 'Plano de Investimentos',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0
      },
      {
        id: 'analise-viabilidade',
        title: 'Análise de Viabilidade',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: [],
        status: 'draft' as const,
        completionPercentage: 0,
        dependencies: ['Análise Financeira', 'Análise de Riscos']
      }
    ]
  };

  // Voting sections (sections in voting phase)
  const votingSections = [
    {
      id: 'customer-relationships',
      title: 'Relacionamento com Clientes',
      content: 'Estabeleceremos relacionamentos próximos através de suporte personalizado, consultoria especializada e programas de fidelidade. Nossa abordagem será baseada em atendimento consultivo e parcerias estratégicas de longo prazo.',
      votes: { approved: 2, rejected: 1, total: 3 },
      deadline: '15/12/2024'
    },
    {
      id: 'resumo-executivo',
      title: 'Resumo Executivo',
      content: 'Nossa empresa desenvolve soluções inovadoras para o mercado B2B, focando em automação de processos e análise de dados. Com um investimento inicial de R$ 500.000, projetamos receita de R$ 2 milhões no terceiro ano.',
      votes: { approved: 4, rejected: 1, total: 5 },
      deadline: '20/12/2024'
    }
  ];

  // Enhanced progress data
  const projectStats = {
    totalSections: 24,
    approvedSections: 6,
    pendingSections: 8,
    rejectedSections: 1,
    teamMembers: 6,
    overallProgress: 42
  };

  const sectionProgress = [
    {
      category: 'Business Model Canvas',
      sections: [
        { name: 'Proposta de Valor', status: 'approved' as const, progress: 100 },
        { name: 'Segmentos de Clientes', status: 'pending' as const, progress: 75 },
        { name: 'Canais', status: 'draft' as const, progress: 30 },
        { name: 'Relacionamento', status: 'pending' as const, progress: 80 },
        { name: 'Fontes de Receita', status: 'draft' as const, progress: 20 },
        { name: 'Recursos-Chave', status: 'draft' as const, progress: 10 }
      ]
    },
    {
      category: 'Conceito',
      sections: [
        { name: 'Resumo Executivo', status: 'pending' as const, progress: 75 },
        { name: 'Missão e Visão', status: 'draft' as const, progress: 25 },
        { name: 'Objetivos Estratégicos', status: 'draft' as const, progress: 0 },
        { name: 'Modelo de Negócio', status: 'draft' as const, progress: 0 }
      ]
    },
    {
      category: 'Pesquisa',
      sections: [
        { name: 'Análise de Mercado', status: 'approved' as const, progress: 100 },
        { name: 'Personas de Cliente', status: 'draft' as const, progress: 40 },
        { name: 'Análise da Concorrência', status: 'draft' as const, progress: 30 },
        { name: 'Tendências de Mercado', status: 'draft' as const, progress: 0 }
      ]
    },
    {
      category: 'Projeções',
      sections: [
        { name: 'Análise Financeira', status: 'draft' as const, progress: 15 },
        { name: 'Projeções de Receita', status: 'draft' as const, progress: 0 },
        { name: 'Análise de Riscos', status: 'draft' as const, progress: 10 },
        { name: 'Análise de Viabilidade', status: 'draft' as const, progress: 0 }
      ]
    }
  ];

  // Navigation and category items
  const navigationItems = [
    { id: 'canvas', label: 'Canvas', icon: <FileText className="w-4 h-4" /> },
    { id: 'detalhado', label: 'Plano Detalhado', icon: <Users className="w-4 h-4" /> },
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

  // Enhanced handler functions
  const handleUpdateCanvasSection = (id: string, content: string) => {
    setCanvasSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
    console.log('Canvas section updated:', id, content);
  };

  const handleStartVoting = (id: string) => {
    setCanvasSections(prev => prev.map(section => 
      section.id === id ? { ...section, status: 'voting' } : section
    ));
    console.log('Starting voting for section:', id);
  };

  const handleSectionSave = (id: string, content: string) => {
    console.log('Saving section:', id, content);
  };

  const handleVote = (sectionId: string, vote: 'approve' | 'reject', comment?: string) => {
    console.log('Voting:', sectionId, vote, comment);
  };

  const handleAddComment = (sectionId: string, content: string, parentId?: string) => {
    console.log('Adding comment:', sectionId, content, parentId);
  };

  const handleLikeComment = (commentId: string) => {
    console.log('Liking comment:', commentId);
  };

  const handleResolveComment = (commentId: string) => {
    console.log('Resolving comment:', commentId);
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

  const overallProgress = Math.round(canvasSections.filter(s => s.status === 'approved').length / canvasSections.length * 100);

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
              {/* Online users indicator - hidden on small screens */}
              {onlineUsers.length > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{onlineUsers.length} online</span>
                </div>
              )}
              
              {/* Progress indicator - simplified on mobile */}
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

              {/* Action buttons - simplified on mobile */}
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

            <CanvasEditor
              sections={canvasSections}
              onUpdateSection={handleUpdateCanvasSection}
              onStartVoting={handleStartVoting}
            />
          </div>
        )}

        {/* Detailed Plan View */}
        {activeSection === 'detalhado' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Plano de Negócios Detalhado</h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto px-4">
                Desenvolva cada seção do seu plano de negócios com profundidade e colaboração. Cada seção possui métricas de progresso, comentários e sistema de aprovação.
              </p>
            </div>

            {/* Category Navigation - Responsive */}
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

            {/* Sections for selected category */}
            <div className="space-y-3 sm:space-y-4">
              {detailedSections[activeCategory as keyof typeof detailedSections]?.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onSave={handleSectionSave}
                  onStartVoting={handleStartVoting}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                  onResolveComment={handleResolveComment}
                />
              ))}
            </div>
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
