
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit3, Save, X, MessageCircle, ThumbsUp, ThumbsDown, Users, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CommentsSection from './CommentsSection';

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
  isResolved?: boolean;
}

interface SectionEditorProps {
  section: {
    id: string;
    title: string;
    content: string;
    votes: { approved: number; rejected: number; total: number };
    comments: Comment[];
    status: 'draft' | 'voting' | 'approved' | 'rejected';
    assignedTo?: string;
    deadline?: string;
    dependencies?: string[];
    completionPercentage: number;
  };
  onSave: (id: string, content: string) => void;
  onStartVoting: (id: string) => void;
  onAddComment: (sectionId: string, content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ 
  section, 
  onSave, 
  onStartVoting,
  onAddComment,
  onLikeComment,
  onResolveComment
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(section.id, content);
    setIsEditing(false);
    toast({
      title: "Seção salva",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  const handleCancel = () => {
    setContent(section.content);
    setIsEditing(false);
  };

  const getStatusColor = () => {
    switch (section.status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (section.status) {
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      case 'voting': return 'Em Votação';
      default: return 'Rascunho';
    }
  };

  const hasUnresolvedComments = section.comments.some(comment => !comment.isResolved);
  const approvalPercentage = section.votes.total > 0 
    ? Math.round((section.votes.approved / section.votes.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {section.status === 'voting' && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span>{section.votes.approved}</span>
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <span>{section.votes.rejected}</span>
                  <span className="text-xs">({approvalPercentage}%)</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                <span>{section.comments.length}</span>
                {hasUnresolvedComments && (
                  <AlertCircle className="w-3 h-3 ml-1 text-orange-500" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress and metadata */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progresso da seção</span>
              <span>{section.completionPercentage}%</span>
            </div>
            <Progress value={section.completionPercentage} className="h-2" />
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {section.assignedTo && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>Responsável: {section.assignedTo}</span>
                </div>
              )}
              {section.deadline && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Prazo: {section.deadline}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo desta seção..."
                className="min-h-[120px]"
              />
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="min-h-[60px] p-3 bg-gray-50 rounded-md">
                {content || (
                  <span className="text-gray-500 italic">
                    Clique em editar para adicionar conteúdo...
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                {section.status !== 'approved' && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                {section.status === 'draft' && content && (
                  <Button onClick={() => onStartVoting(section.id)} size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Enviar para Votação
                  </Button>
                )}
              </div>
              
              {/* Dependencies warning */}
              {section.dependencies && section.dependencies.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Esta seção depende de: {section.dependencies.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      {showComments && (
        <CommentsSection
          sectionId={section.id}
          comments={section.comments}
          onAddComment={onAddComment}
          onLikeComment={onLikeComment}
          onResolveComment={onResolveComment}
        />
      )}
    </div>
  );
};

export default SectionEditor;
