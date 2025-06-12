
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Vote, Save, Users } from 'lucide-react';
import CommentsSection from './CommentsSection';

interface Section {
  id: string;
  title: string;
  content: string;
  votes: { approved: number; rejected: number; total: number };
  comments: any[];
  status: 'draft' | 'voting' | 'approved' | 'rejected';
  assignedTo?: string;
  deadline?: string;
  completionPercentage: number;
  dependencies?: string[];
}

interface SectionEditorProps {
  section: Section;
  onSave: (id: string, content: string) => void;
  onStartVoting: (id: string) => void;
  onAddComment: (sectionId: string, content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
}

const SectionEditor = ({
  section,
  onSave,
  onStartVoting,
  onAddComment,
  onLikeComment,
  onResolveComment
}: SectionEditorProps) => {
  const [content, setContent] = useState(section.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleSave = () => {
    onSave(section.id, content);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'voting': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{section.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(section.status)}>
              {section.status}
            </Badge>
            {section.assignedTo && (
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {section.assignedTo}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{section.completionPercentage}%</span>
          </div>
          <Progress value={section.completionPercentage} className="w-full" />
        </div>

        {/* Dependencies */}
        {section.dependencies && section.dependencies.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Dependências: </span>
            {section.dependencies.join(', ')}
          </div>
        )}

        {/* Deadline */}
        {section.deadline && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Prazo: </span>
            {section.deadline}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Editor */}
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Desenvolva o conteúdo desta seção..."
              />
              <div className="flex space-x-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="min-h-[100px] p-4 border rounded-lg bg-gray-50">
                {content || 'Clique em editar para desenvolver esta seção...'}
              </div>
              <Button onClick={() => setIsEditing(true)}>
                Editar Seção
              </Button>
            </div>
          )}
        </div>

        {/* Voting Section */}
        {section.status === 'voting' && (
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h4 className="font-medium mb-2">Em Votação</h4>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Aprovados: {section.votes.approved} | Rejeitados: {section.votes.rejected}
              </div>
              <Badge variant="outline">
                <Vote className="w-3 h-3 mr-1" />
                {section.votes.total} votos
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comentários ({section.comments.length})
            </Button>
            
            {section.status === 'draft' && content && (
              <Button
                onClick={() => onStartVoting(section.id)}
                variant="outline"
              >
                <Vote className="w-4 h-4 mr-2" />
                Enviar para Votação
              </Button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentsSection
            comments={section.comments}
            onAddComment={(content, parentId) => onAddComment(section.id, content, parentId)}
            onLikeComment={onLikeComment}
            onResolveComment={onResolveComment}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SectionEditor;
