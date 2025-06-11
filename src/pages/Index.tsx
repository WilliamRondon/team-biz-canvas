import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Target, Lightbulb, DollarSign, TrendingUp, Settings, FileText, CheckCircle } from 'lucide-react';

const Index = () => {
  const [activeSection, setActiveSection] = useState('canvas');

  const canvasSections = [
    {
      id: 'key-partners',
      title: 'Parceiros-Chave',
      icon: <Users className="w-5 h-5" />,
      description: 'Quem são os seus principais parceiros e fornecedores?',
      color: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      progress: 0
    },
    {
      id: 'key-activities',
      title: 'Atividades-Chave',
      icon: <Settings className="w-5 h-5" />,
      description: 'Quais são as atividades mais importantes para o sucesso do seu negócio?',
      color: 'bg-gradient-to-br from-purple-50 to-blue-100',
      progress: 0
    },
    {
      id: 'key-resources',
      title: 'Recursos-Chave',
      icon: <Target className="w-5 h-5" />,
      description: 'Quais recursos são essenciais para seu modelo de negócio?',
      color: 'bg-gradient-to-br from-green-50 to-emerald-100',
      progress: 0
    },
    {
      id: 'value-proposition',
      title: 'Proposta de Valor',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Qual valor único você oferece aos seus clientes?',
      color: 'bg-gradient-to-br from-yellow-50 to-orange-100',
      progress: 0
    },
    {
      id: 'customer-relationships',
      title: 'Relacionamento com Clientes',
      icon: <Users className="w-5 h-5" />,
      description: 'Como você se relaciona com seus clientes?',
      color: 'bg-gradient-to-br from-pink-50 to-rose-100',
      progress: 0
    },
    {
      id: 'channels',
      title: 'Canais',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Como você alcança e entrega valor aos seus clientes?',
      color: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      progress: 0
    },
    {
      id: 'customer-segments',
      title: 'Segmentos de Clientes',
      icon: <Target className="w-5 h-5" />,
      description: 'Quem são seus clientes mais importantes?',
      color: 'bg-gradient-to-br from-violet-50 to-purple-100',
      progress: 0
    },
    {
      id: 'cost-structure',
      title: 'Estrutura de Custos',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Quais são os custos mais importantes do seu modelo?',
      color: 'bg-gradient-to-br from-red-50 to-pink-100',
      progress: 0
    },
    {
      id: 'revenue-streams',
      title: 'Fontes de Receita',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Como você gera receita com cada segmento?',
      color: 'bg-gradient-to-br from-emerald-50 to-green-100',
      progress: 0
    }
  ];

  const navigationItems = [
    { id: 'canvas', label: 'Canvas', icon: <FileText className="w-4 h-4" /> },
    { id: 'empresa', label: 'Empresa', icon: <Users className="w-4 h-4" /> },
    { id: 'mercado', label: 'Mercado', icon: <Target className="w-4 h-4" /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'aprovacao', label: 'Aprovação', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const overallProgress = Math.round(canvasSections.reduce((acc, section) => acc + section.progress, 0) / canvasSections.length);

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {canvasSections.slice(0, 3).map((section) => (
                  <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-slate-800">
                        <div className="flex items-center space-x-2">
                          {section.icon}
                          <span className="text-sm font-semibold">{section.title}</span>
                        </div>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 mb-3">{section.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="w-16 bg-white/50 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${section.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{section.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Center Column */}
              <div className="space-y-6">
                {canvasSections.slice(3, 6).map((section) => (
                  <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-slate-800">
                        <div className="flex items-center space-x-2">
                          {section.icon}
                          <span className="text-sm font-semibold">{section.title}</span>
                        </div>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 mb-3">{section.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="w-16 bg-white/50 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${section.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{section.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {canvasSections.slice(6, 9).map((section) => (
                  <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-slate-800">
                        <div className="flex items-center space-x-2">
                          {section.icon}
                          <span className="text-sm font-semibold">{section.title}</span>
                        </div>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 mb-3">{section.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="w-16 bg-white/50 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${section.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{section.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Sections Placeholder */}
        {activeSection !== 'canvas' && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h3>
              <p className="text-slate-600 mb-6">
                Esta seção será implementada nas próximas iterações do sistema.
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
