
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Check, Reply } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isResolved: boolean;
  replies?: Comment[];
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
}

const CommentsSection = ({
  comments,
  onAddComment,
  onLikeComment,
  onResolveComment
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleAddReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId);
      setReplyContent('');
      setReplyToId(null);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`p-3 border rounded-lg ${isReply ? 'ml-6 bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{comment.author}</span>
          <span className="text-xs text-gray-500">{comment.timestamp}</span>
          {comment.isResolved && (
            <Badge variant="outline" className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              Resolvido
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm mb-3">{comment.content}</p>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLikeComment(comment.id)}
          className="text-xs"
        >
          <ThumbsUp className="w-3 h-3 mr-1" />
          {comment.likes}
        </Button>
        
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
            className="text-xs"
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
            className="text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Resolver
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {replyToId === comment.id && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escreva sua resposta..."
            className="text-sm"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={() => handleAddReply(comment.id)}>
              Responder
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReplyToId(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium flex items-center">
        <MessageSquare className="w-4 h-4 mr-2" />
        Comentários
      </h4>

      {/* Add New Comment */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          className="min-h-[80px]"
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          Comentar
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhum comentário ainda</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
