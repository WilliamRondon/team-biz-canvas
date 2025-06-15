
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  const [votingStates, setVotingStates] = useState<{[key: string]: {
    selectedVote: 'approve' | 'reject' | null;
    comment: string;
    submitting: boolean;
  }}>({});
  const { currentBusinessPlan } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadVotingSessions();
    }
  }, [currentBusinessPlan]);

  const loadVotingSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_voting_sessions_with_counts', {
          business_plan_id_param: currentBusinessPlan?.business_plan_id
        });

      if (error) {
        console.error('Error loading voting sessions:', error);
        throw error;
      }

      console.log('Loaded voting sessions:', data);

      // Map and type the data correctly
      const mappedSessions: VotingSession[] = (data || []).map((session: any) => ({
        id: session.id,
        item_id: session.item_id,
        item_type: session.item_type as 'canvas_item' | 'detailed_section',
        title: session.title,
        content: session.content,
        status: session.status,
        deadline: session.deadline,
        total_votes: Number(session.total_votes) || 0,
        approve_votes: Number(session.approve_votes) || 0,
        reject_votes: Number(session.reject_votes) || 0,
        user_vote: session.user_vote,
        user_comment: session.user_comment,
        created_at: session.created_at
      }));

      setVotingSessions(mappedSessions);

      // Initialize voting states for sessions where user hasn't voted
      const initialStates: any = {};
      mappedSessions.forEach((session) => {
        if (!session.user_vote) {
          initialStates[session.id] = {
            selectedVote: null,
            comment: '',
            submitting: false
          };
        }
      });
      setVotingStates(initialStates);

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
  };

  const updateVotingState = (sessionId: string, updates: Partial<typeof votingStates[string]>) => {
    setVotingStates(prev => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], ...updates }
    }));
  };

  const submitVote = async (sessionId: string) => {
    const state = votingStates[sessionId];
    if (!state?.selectedVote) return;

    try {
      updateVotingState(sessionId, { submitting: true });

      const { error } = await supabase
        .from('votes')
        .insert({
          voting_session_id: sessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          vote_type: state.selectedVote,
          comment: state.comment || null
        });

      if (error) {
        console.error('Error submitting vote:', error);
        throw error;
      }

      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso!",
      });

      // Reload sessions to get updated counts
      await loadVotingSessions();

    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu voto.",
        variant: "destructive"
      });
    } finally {
      updateVotingState(sessionId, { submitting: false });
    }
  };

  const getApprovalPercentage = (session: VotingSession) => {
    return session.total_votes > 0 
      ? (session.approve_votes / session.total_votes) * 100 
      : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhuma sessão de votação ativa no momento.</p>
        <p className="text-sm text-gray-500 mt-2">
          Quando itens do Canvas ou seções detalhadas forem enviadas para votação, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Centro de Votação</h2>
        <p className="text-gray-600">
          Vote nas seções submetidas pela equipe. Sua participação é fundamental para o consenso.
        </p>
      </div>

      {votingSessions.map((session) => {
        const hasVoted = session.user_vote !== null;
        const state = votingStates[session.id];
        const approvalPercentage = getApprovalPercentage(session);

        return (
          <Card key={session.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{session.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  {session.deadline && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(session.deadline)}
                    </Badge>
                  )}
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Em Votação
                  </Badge>
                  <Badge variant="outline">
                    {session.item_type === 'canvas_item' ? 'Canvas' : 'Seção Detalhada'}
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
              {!hasVoted && state ? (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Seu Voto</h4>
                  
                  {/* Vote Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant={state.selectedVote === 'approve' ? 'default' : 'outline'}
                      onClick={() => updateVotingState(session.id, { selectedVote: 'approve' })}
                      className="flex-1"
                      disabled={state.submitting}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant={state.selectedVote === 'reject' ? 'destructive' : 'outline'}
                      onClick={() => updateVotingState(session.id, { selectedVote: 'reject' })}
                      className="flex-1"
                      disabled={state.submitting}
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
                      value={state.comment}
                      onChange={(e) => updateVotingState(session.id, { comment: e.target.value })}
                      placeholder="Adicione um comentário sobre sua decisão..."
                      className="min-h-[80px]"
                      disabled={state.submitting}
                    />
                  </div>

                  {/* Submit Vote */}
                  <Button 
                    onClick={() => submitVote(session.id)}
                    disabled={!state.selectedVote || state.submitting}
                    className="w-full"
                  >
                    {state.submitting ? 'Enviando...' : 'Confirmar Voto'}
                  </Button>
                </div>
              ) : hasVoted && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-green-600 mb-2">
                        {session.user_vote === 'approve' ? 
                          <ThumbsUp className="w-6 h-6 mx-auto" /> : 
                          <ThumbsDown className="w-6 h-6 mx-auto" />
                        }
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
