
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Reply, ThumbsUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface CommentsSectionProps {
  sectionId: string;
  comments: Comment[];
  onAddComment: (sectionId: string, content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  sectionId, 
  comments, 
  onAddComment, 
  onLikeComment, 
  onResolveComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(sectionId, newComment);
    setNewComment('');
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso.",
    });
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    onAddComment(sectionId, replyContent, parentId);
    setReplyContent('');
    setReplyTo(null);
    toast({
      title: "Resposta adicionada",
      description: "Sua resposta foi adicionada com sucesso.",
    });
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`border-l-2 ${isReply ? 'ml-8 border-gray-200' : 'border-blue-200'} pl-4 py-3`}>
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.avatar} />
          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.author}</span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{comment.timestamp}</span>
            </div>
            {comment.isResolved && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Resolvido
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeComment(comment.id)}
              className="text-xs h-6 px-2"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              {comment.likes}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs h-6 px-2"
              >
                <Reply className="w-3 h-3 mr-1" />
                Responder
              </Button>
            )}
            {!comment.isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolveComment(comment.id)}
                className="text-xs h-6 px-2 text-green-600"
              >
                Resolver
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
      
      {/* Reply Form */}
      {replyTo === comment.id && (
        <div className="mt-3 ml-8">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escreva sua resposta..."
            className="min-h-[60px] text-sm"
          />
          <div className="flex space-x-2 mt-2">
            <Button 
              onClick={() => handleAddReply(comment.id)} 
              size="sm"
              disabled={!replyContent.trim()}
            >
              <Send className="w-3 h-3 mr-1" />
              Responder
            </Button>
            <Button 
              onClick={() => setReplyTo(null)} 
              variant="outline" 
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          <span>Comentários ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add new comment */}
        <div className="space-y-3 mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário para discussão..."
            className="min-h-[80px]"
          />
          <Button 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            Adicionar Comentário
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Ainda não há comentários nesta seção.</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
