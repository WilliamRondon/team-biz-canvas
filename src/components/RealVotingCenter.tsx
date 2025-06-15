import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Clock, Vote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeVotingSessions } from '@/hooks/useRealtimeVotingSessions';
import { useRealtimeVotingResults } from '@/hooks/useRealtimeVotingResults';

interface VotingSession {
  id: string;
  item_id: string;
  item_type: 'canvas_item' | 'detailed_section';
  title: string;
  content: string;
  status: string;
  deadline: string | null;
  total_votes: number;
  approve_votes: number;
  reject_votes: number;
  user_vote: string | null;
  user_comment: string | null;
  created_at: string;
}

const RealVotingCenter = () => {
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingOnSession, setVotingOnSession] = useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = useState<{ [key: string]: 'approve' | 'reject' | null }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();

  const loadVotingSessions = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!currentBusinessPlan?.business_plan_id) {
        console.log('No business plan found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('get_voting_sessions_with_counts', {
          business_plan_id_param: currentBusinessPlan.business_plan_id
        });

      if (error) {
        console.error('Error loading voting sessions:', error);
        throw error;
      }

      console.log('Loaded voting sessions:', data);
      
      const mappedSessions = (data || []).map(session => ({
        id: session.id,
        item_id: session.item_id,
        item_type: session.item_type as 'canvas_item' | 'detailed_section',
        title: session.title,
        content: session.content,
        status: session.status,
        deadline: session.deadline ? new Date(session.deadline).toLocaleDateString('pt-BR') : null,
        total_votes: Number(session.total_votes) || 0,
        approve_votes: Number(session.approve_votes) || 0,
        reject_votes: Number(session.reject_votes) || 0,
        user_vote: session.user_vote,
        user_comment: session.user_comment,
        created_at: session.created_at
      }));

      setVotingSessions(mappedSessions);
      
    } catch (error) {
      console.error('Error loading voting sessions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões de votação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentBusinessPlan?.business_plan_id, toast]);

  // Use realtime for updates including voting results
  useRealtimeVotingSessions(currentBusinessPlan?.business_plan_id || '', loadVotingSessions);
  useRealtimeVotingResults(currentBusinessPlan?.business_plan_id || '', loadVotingSessions);

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadVotingSessions();
    }
  }, [currentBusinessPlan, loadVotingSessions]);

  const handleVote = async (sessionId: string) => {
    const selectedVote = selectedVotes[sessionId];
    const comment = comments[sessionId];

    if (!selectedVote) {
      toast({
        title: "Erro",
        description: "Selecione uma opção de voto.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVotingOnSession(sessionId);

      const { error } = await supabase
        .from('votes')
        .insert({
          voting_session_id: sessionId,
          user_id: user?.id,
          vote_type: selectedVote,
          comment: comment || null
        });

      if (error) {
        console.error('Error voting:', error);
        throw error;
      }

      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso!",
      });

      // Clear local state for this session
      setSelectedVotes(prev => ({ ...prev, [sessionId]: null }));
      setComments(prev => ({ ...prev, [sessionId]: '' }));

      // Reload voting sessions to get updated data
      setTimeout(() => loadVotingSessions(), 500);

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive"
      });
    } finally {
      setVotingOnSession(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando sessões de votação...</p>
      </div>
    );
  }

  if (votingSessions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 sm:py-16">
          <Vote className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Nenhuma votação pendente</h3>
          <p className="text-gray-600 text-sm sm:text-base px-4">
            Quando a equipe submeter seções para aprovação, elas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {votingSessions.map((session) => {
        const approvalPercentage = session.total_votes > 0 
          ? (session.approve_votes / session.total_votes) * 100 
          : 0;
        
        const hasVoted = session.user_vote !== null;
        const selectedVote = selectedVotes[session.id];
        const comment = comments[session.id] || '';

        return (
          <Card key={session.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{session.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {session.deadline && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.deadline}
                    </Badge>
                  )}
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
                <p className="text-sm">{session.content}</p>
              </div>

              {/* Voting Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso da Votação</span>
                  <span className="text-sm text-gray-600">
                    {session.total_votes} voto{session.total_votes !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <Progress value={approvalPercentage} className="w-full" />
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-green-600">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {session.approve_votes} aprovações
                  </div>
                  <div className="flex items-center text-red-600">
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {session.reject_votes} rejeições
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
                      onClick={() => setSelectedVotes(prev => ({ ...prev, [session.id]: 'approve' }))}
                      className="flex-1"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant={selectedVote === 'reject' ? 'destructive' : 'outline'}
                      onClick={() => setSelectedVotes(prev => ({ ...prev, [session.id]: 'reject' }))}
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
                      onChange={(e) => setComments(prev => ({ ...prev, [session.id]: e.target.value }))}
                      placeholder="Adicione um comentário sobre sua decisão..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Submit Vote */}
                  <Button 
                    onClick={() => handleVote(session.id)}
                    disabled={!selectedVote || votingOnSession === session.id}
                    className="w-full"
                  >
                    {votingOnSession === session.id ? 'Registrando...' : 'Confirmar Voto'}
                  </Button>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-green-600 mb-2">
                        {session.user_vote === 'approve' ? <ThumbsUp className="w-6 h-6 mx-auto" /> : <ThumbsDown className="w-6 h-6 mx-auto" />}
                      </div>
                      <p className="text-sm font-medium text-green-800">
                        Voto registrado com sucesso!
                      </p>
                      {session.user_comment && (
                        <p className="text-xs text-green-600 mt-1">
                          Comentário: "{session.user_comment}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RealVotingCenter;
