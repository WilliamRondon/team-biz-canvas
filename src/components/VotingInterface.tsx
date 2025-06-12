
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Clock, MessageSquare } from 'lucide-react';

interface VotingSection {
  id: string;
  title: string;
  content: string;
  votes: { approved: number; rejected: number; total: number };
  deadline: string;
}

interface VotingInterfaceProps {
  section: VotingSection;
  onVote: (sectionId: string, vote: 'approve' | 'reject', comment?: string) => void;
}

const VotingInterface = ({ section, onVote }: VotingInterfaceProps) => {
  const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedVote) {
      onVote(section.id, selectedVote, comment);
      setHasVoted(true);
    }
  };

  const approvalPercentage = section.votes.total > 0 
    ? (section.votes.approved / section.votes.total) * 100 
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{section.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {section.deadline}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              Em Votação
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content to Vote On */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Conteúdo para Aprovação</h4>
          <p className="text-sm">{section.content}</p>
        </div>

        {/* Voting Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso da Votação</span>
            <span className="text-sm text-gray-600">
              {section.votes.total} voto{section.votes.total !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Progress value={approvalPercentage} className="w-full" />
          
          <div className="flex justify-between text-sm">
            <div className="flex items-center text-green-600">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {section.votes.approved} aprovações
            </div>
            <div className="flex items-center text-red-600">
              <ThumbsDown className="w-4 h-4 mr-1" />
              {section.votes.rejected} rejeições
            </div>
          </div>
        </div>

        {/* Voting Interface */}
        {!hasVoted ? (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Seu Voto</h4>
            
            {/* Vote Buttons */}
            <div className="flex space-x-2">
              <Button
                variant={selectedVote === 'approve' ? 'default' : 'outline'}
                onClick={() => setSelectedVote('approve')}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                variant={selectedVote === 'reject' ? 'destructive' : 'outline'}
                onClick={() => setSelectedVote('reject')}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Comentário (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Adicione um comentário sobre sua decisão..."
                className="min-h-[80px]"
              />
            </div>

            {/* Submit Vote */}
            <Button 
              onClick={handleVote}
              disabled={!selectedVote}
              className="w-full"
            >
              Confirmar Voto
            </Button>
          </div>
        ) : (
          <div className="border-t pt-4">
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-green-600 mb-2">
                  {selectedVote === 'approve' ? <ThumbsUp className="w-6 h-6 mx-auto" /> : <ThumbsDown className="w-6 h-6 mx-auto" />}
                </div>
                <p className="text-sm font-medium text-green-800">
                  Voto registrado com sucesso!
                </p>
                {comment && (
                  <p className="text-xs text-green-600 mt-1">
                    Comentário: "{comment}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VotingInterface;
