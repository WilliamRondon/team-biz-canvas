
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Users, Target, Settings, DollarSign, TrendingUp, FileText, CheckCircle, Vote, BarChart3 } from 'lucide-react';
import CanvasEditor from '@/components/CanvasEditor';
import SectionEditor from '@/components/SectionEditor';
import VotingInterface from '@/components/VotingInterface';
import ProgressDashboard from '@/components/ProgressDashboard';

const Index = () => {
  const [activeSection, setActiveSection] = useState('canvas');
  const [activeCategory, setActiveCategory] = useState('conceito');

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

  // Detailed sections data
  const detailedSections = {
    conceito: [
      {
        id: 'resumo-executivo',
        title: 'Resumo Executivo',
        content: 'Nossa empresa desenvolve soluções inovadoras para o mercado B2B...',
        votes: { approved: 4, rejected: 1, total: 5 },
        comments: 3,
        status: 'voting' as const
      },
      {
        id: 'missao-visao',
        title: 'Missão e Visão',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
      }
    ],
    pesquisa: [
      {
        id: 'analise-mercado',
        title: 'Análise de Mercado',
        content: 'O mercado brasileiro de tecnologia tem crescido...',
        votes: { approved: 3, rejected: 0, total: 3 },
        comments: 2,
        status: 'approved' as const
      },
      {
        id: 'personas',
        title: 'Personas de Cliente',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
      }
    ],
    configuracao: [
      {
        id: 'estrutura-organizacional',
        title: 'Estrutura Organizacional',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
      },
      {
        id: 'plano-operacional',
        title: 'Plano Operacional',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
      }
    ],
    projecoes: [
      {
        id: 'analise-financeira',
        title: 'Análise Financeira',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
      },
      {
        id: 'analise-riscos',
        title: 'Análise de Riscos',
        content: '',
        votes: { approved: 0, rejected: 0, total: 0 },
        comments: 0,
        status: 'draft' as const
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

  // Progress data
  const projectStats = {
    totalSections: 20,
    approvedSections: 6,
    pendingSections: 4,
    rejectedSections: 1,
    teamMembers: 5,
    overallProgress: 35
  };

  const sectionProgress = [
    {
      category: 'Business Model Canvas',
      sections: [
        { name: 'Proposta de Valor', status: 'approved' as const, progress: 100 },
        { name: 'Segmentos de Clientes', status: 'pending' as const, progress: 75 },
        { name: 'Canais', status: 'draft' as const, progress: 30 },
        { name: 'Relacionamento', status: 'pending' as const, progress: 80 }
      ]
    },
    {
      category: 'Plano Detalhado',
      sections: [
        { name: 'Análise de Mercado', status: 'approved' as const, progress: 100 },
        { name: 'Resumo Executivo', status: 'pending' as const, progress: 90 },
        { name: 'Análise Financeira', status: 'draft' as const, progress: 20 },
        { name: 'Análise de Riscos', status: 'draft' as const, progress: 0 }
      ]
    }
  ];

  const navigationItems = [
    { id: 'canvas', label: 'Canvas', icon: <FileText className="w-4 h-4" /> },
    { id: 'detalhado', label: 'Plano Detalhado', icon: <Users className="w-4 h-4" /> },
    { id: 'votacao', label: 'Votação', icon: <Vote className="w-4 h-4" /> },
    { id: 'progresso', label: 'Progresso', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'aprovacao', label: 'Aprovação', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const categoryItems = [
    { id: 'conceito', label: 'Conceito' },
    { id: 'pesquisa', label: 'Pesquisa' },
    { id: 'configuracao', label: 'Configuração' },
    { id: 'projecoes', label: 'Projeções' }
  ];

  const handleUpdateCanvasSection = (id: string, content: string) => {
    setCanvasSections(prev => prev.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  const handleStartVoting = (id: string) => {
    setCanvasSections(prev => prev.map(section => 
      section.id === id ? { ...section, status: 'voting' } : section
    ));
  };

  const handleSectionSave = (id: string, content: string) => {
    console.log('Saving section:', id, content);
  };

  const handleVote = (sectionId: string, vote: 'approve' | 'reject', comment?: string) => {
    console.log('Voting:', sectionId, vote, comment);
  };

  const overallProgress = Math.round(canvasSections.filter(s => s.status === 'approved').length / canvasSections.length * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Business Plan Studio</h1>
                <p className="text-sm text-slate-600">Sistema Colaborativo de Plano de Negócios</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Progresso Geral</p>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{overallProgress}%</span>
                </div>
              </div>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Exportar
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
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

        {/* Canvas View */}
        {activeSection === 'canvas' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Business Model Canvas</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
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
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Plano de Negócios Detalhado</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Desenvolva cada seção do seu plano de negócios com profundidade e colaboração.
              </p>
            </div>

            {/* Category Navigation */}
            <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-lg p-1 border border-slate-200 mb-6">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeCategory === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Sections for selected category */}
            <div className="space-y-4">
              {detailedSections[activeCategory as keyof typeof detailedSections]?.map((section) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onSave={handleSectionSave}
                  onStartVoting={handleStartVoting}
                />
              ))}
            </div>
          </div>
        )}

        {/* Voting View */}
        {activeSection === 'votacao' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Centro de Votação</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Vote nas seções submetidas pela equipe. Sua participação é fundamental para o consenso.
              </p>
            </div>

            {votingSections.length > 0 ? (
              <div className="space-y-4">
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
                <CardContent className="text-center py-16">
                  <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma votação pendente</h3>
                  <p className="text-gray-600">
                    Quando a equipe submeter seções para aprovação, elas aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Progress View */}
        {activeSection === 'progresso' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard de Progresso</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
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
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-8 border border-slate-200">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Seções Aprovadas</h3>
              <p className="text-slate-600 mb-6">
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
