
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit3, Save, X, MessageCircle, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CanvasSection {
  id: string;
  title: string;
  description: string;
  content: string;
  color: string;
  icon: React.ReactNode;
  status: 'draft' | 'voting' | 'approved';
  votes: { approved: number; rejected: number };
  comments: number;
}

interface CanvasEditorProps {
  sections: CanvasSection[];
  onUpdateSection: (id: string, content: string) => void;
  onStartVoting: (id: string) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ sections, onUpdateSection, onStartVoting }) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState('');
  const { toast } = useToast();

  const handleEdit = (section: CanvasSection) => {
    setEditingSection(section.id);
    setTempContent(section.content);
  };

  const handleSave = (sectionId: string) => {
    onUpdateSection(sectionId, tempContent);
    setEditingSection(null);
    setTempContent('');
    toast({
      title: "Seção atualizada",
      description: "O conteúdo foi salvo com sucesso.",
    });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setTempContent('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'voting': return <Users className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {sections.slice(0, 3).map((section) => (
          <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <div className="flex items-center space-x-2">
                  {section.icon}
                  <span className="text-sm font-semibold">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(section.status)}
                  <div className="flex items-center space-x-1 text-xs text-slate-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>{section.comments}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-3">{section.description}</p>
              
              {editingSection === section.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    placeholder="Digite o conteúdo desta seção..."
                    className="min-h-[100px] text-xs"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSave(section.id)} size="sm" className="text-xs">
                      <Save className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="min-h-[60px] p-2 bg-white/50 rounded text-xs">
                    {section.content || (
                      <span className="text-slate-500 italic">
                        Clique em adicionar para começar...
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(section)}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      disabled={section.status === 'approved'}
                    >
                      {section.content ? (
                        <>
                          <Edit3 className="w-3 h-3 mr-1" />
                          Editar
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </>
                      )}
                    </Button>
                    {section.status === 'draft' && section.content && (
                      <Button
                        onClick={() => onStartVoting(section.id)}
                        size="sm"
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Votar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Center Column */}
      <div className="space-y-6">
        {sections.slice(3, 6).map((section) => (
          <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <div className="flex items-center space-x-2">
                  {section.icon}
                  <span className="text-sm font-semibold">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(section.status)}
                  <div className="flex items-center space-x-1 text-xs text-slate-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>{section.comments}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-3">{section.description}</p>
              
              {editingSection === section.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    placeholder="Digite o conteúdo desta seção..."
                    className="min-h-[100px] text-xs"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSave(section.id)} size="sm" className="text-xs">
                      <Save className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="min-h-[60px] p-2 bg-white/50 rounded text-xs">
                    {section.content || (
                      <span className="text-slate-500 italic">
                        Clique em adicionar para começar...
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(section)}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      disabled={section.status === 'approved'}
                    >
                      {section.content ? (
                        <>
                          <Edit3 className="w-3 h-3 mr-1" />
                          Editar
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </>
                      )}
                    </Button>
                    {section.status === 'draft' && section.content && (
                      <Button
                        onClick={() => onStartVoting(section.id)}
                        size="sm"
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Votar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {sections.slice(6, 9).map((section) => (
          <Card key={section.id} className={`${section.color} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <div className="flex items-center space-x-2">
                  {section.icon}
                  <span className="text-sm font-semibold">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(section.status)}
                  <div className="flex items-center space-x-1 text-xs text-slate-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>{section.comments}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 mb-3">{section.description}</p>
              
              {editingSection === section.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    placeholder="Digite o conteúdo desta seção..."
                    className="min-h-[100px] text-xs"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={() => handleSave(section.id)} size="sm" className="text-xs">
                      <Save className="w-3 h-3 mr-1" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="min-h-[60px] p-2 bg-white/50 rounded text-xs">
                    {section.content || (
                      <span className="text-slate-500 italic">
                        Clique em adicionar para começar...
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEdit(section)}
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      disabled={section.status === 'approved'}
                    >
                      {section.content ? (
                        <>
                          <Edit3 className="w-3 h-3 mr-1" />
                          Editar
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </>
                      )}
                    </Button>
                    {section.status === 'draft' && section.content && (
                      <Button
                        onClick={() => onStartVoting(section.id)}
                        size="sm"
                        className="text-xs"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Votar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CanvasEditor;
