
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VotingInterfaceProps {
  section: {
    id: string;
    title: string;
    content: string;
    votes: { approved: number; rejected: number; total: number };
    deadline: string;
  };
  onVote: (sectionId: string, vote: 'approve' | 'reject', comment?: string) => void;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({ section, onVote }) => {
  const [selectedVote, setSelectedVote] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  const handleVote = () => {
    if (!selectedVote) return;
    
    onVote(section.id, selectedVote, comment);
    setHasVoted(true);
    toast({
      title: "Voto registrado",
      description: `Seu voto foi registrado com sucesso.`,
    });
  };

  const approvalPercentage = section.votes.total > 0 
    ? Math.round((section.votes.approved / section.votes.total) * 100) 
    : 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{section.title}</span>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Prazo: {section.deadline}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{section.content}</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <span className="font-medium">{section.votes.approved}</span>
              <span className="text-sm text-gray-600">aprovações</span>
            </div>
            <div className="flex items-center space-x-2">
              <ThumbsDown className="w-5 h-5 text-red-600" />
              <span className="font-medium">{section.votes.rejected}</span>
              <span className="text-sm text-gray-600">rejeições</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{approvalPercentage}%</div>
            <div className="text-sm text-gray-600">aprovação</div>
          </div>
        </div>

        {!hasVoted && (
          <div className="space-y-4 p-4 border rounded-md">
            <h4 className="font-medium">Seu Voto</h4>
            <div className="flex space-x-4">
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
            
            <Textarea
              placeholder="Comentário opcional (obrigatório para rejeição)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Button 
              onClick={handleVote}
              disabled={!selectedVote || (selectedVote === 'reject' && !comment.trim())}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Confirmar Voto
            </Button>
          </div>
        )}

        {hasVoted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">✓ Voto registrado com sucesso!</p>
            <p className="text-sm text-green-600">Aguarde os demais membros da equipe votarem.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VotingInterface;
