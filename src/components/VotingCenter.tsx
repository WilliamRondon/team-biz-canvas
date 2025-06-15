
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

interface VotingItem {
  id: string;
  type: 'canvas_item' | 'detailed_section';
  title: string;
  content: string;
  deadline?: string;
  votes: {
    total: number;
    approved: number;
    rejected: number;
  };
  userVote?: {
    vote_type: string;
    comment?: string;
  };
}

const VotingCenter = () => {
  const [votingItems, setVotingItems] = useState<VotingItem[]>([]);
  const [selectedVote, setSelectedVote] = useState<{ [key: string]: 'approve' | 'reject' | null }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const { currentBusinessPlan, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadVotingItems();
    }
  }, [currentBusinessPlan]);

  const loadVotingItems = async () => {
    try {
      setLoading(true);
      
      // Load canvas items in voting
      const { data: canvasItems, error: canvasError } = await supabase
        .from('canvas_items')
        .select(`
          id,
          content,
          canvas_sections!inner(
            id,
            title,
            business_plan_id
          )
        `)
        .eq('status', 'voting')
        .eq('canvas_sections.business_plan_id', currentBusinessPlan.business_plan_id);

      if (canvasError) {
        console.error('Error loading canvas items:', canvasError);
      }

      // Load detailed sections in voting
      const { data: detailedSections, error: detailedError } = await supabase
        .from('detailed_sections')
        .select('*')
        .eq('status', 'voting')
        .eq('business_plan_id', currentBusinessPlan.business_plan_id);

      if (detailedError) {
        console.error('Error loading detailed sections:', detailedError);
      }

      // Combine and format voting items
      const items: VotingItem[] = [];

      // Add canvas items
      if (canvasItems) {
        for (const item of canvasItems) {
          const votes = await getVotesForItem(item.id, 'canvas_item');
          const userVote = await getUserVote(item.id, 'canvas_item');
          
          items.push({
            id: item.id,
            type: 'canvas_item',
            title: item.canvas_sections.title,
            content: item.content,
            votes,
            userVote
          });
        }
      }

      // Add detailed sections
      if (detailedSections) {
        for (const section of detailedSections) {
          const votes = await getVotesForItem(section.id, 'detailed_section');
          const userVote = await getUserVote(section.id, 'detailed_section');
          
          items.push({
            id: section.id,
            type: 'detailed_section',
            title: section.title,
            content: section.content || '',
            deadline: section.deadline,
            votes,
            userVote
          });
        }
      }

      setVotingItems(items);
      
    } catch (error) {
      console.error('Error loading voting items:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens em votação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVotesForItem = async (itemId: string, itemType: string) => {
    const tableName = itemType === 'canvas_item' ? 'canvas_items' : 'detailed_sections';
    const { data, error } = await supabase
      .from('item_votes')
      .select('vote_type')
      .eq('item_id', itemId);

    if (error) {
      console.error('Error loading votes:', error);
      return { total: 0, approved: 0, rejected: 0 };
    }

    const total = data?.length || 0;
    const approved = data?.filter(v => v.vote_type === 'approve').length || 0;
    const rejected = data?.filter(v => v.vote_type === 'reject').length || 0;

    return { total, approved, rejected };
  };

  const getUserVote = async (itemId: string, itemType: string) => {
    const { data, error } = await supabase
      .from('item_votes')
      .select('vote_type, comment')
      .eq('item_id', itemId)
      .eq('user_id', user?.id)
      .single();

    if (error || !data) {
      return undefined;
    }

    return {
      vote_type: data.vote_type,
      comment: data.comment
    };
  };

  const submitVote = async (itemId: string, itemType: string) => {
    const voteType = selectedVote[itemId];
    const comment = comments[itemId];

    if (!voteType) return;

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('item_votes')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user?.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('item_votes')
          .update({
            vote_type: voteType,
            comment: comment?.trim() || null
          })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Create new vote
        const { error } = await supabase
          .from('item_votes')
          .insert({
            item_id: itemId,
            user_id: user?.id,
            vote_type: voteType,
            comment: comment?.trim() || null
          });

        if (error) throw error;
      }

      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso.",
      });

      // Reload voting items to update counts
      loadVotingItems();
      
      // Clear local state
      setSelectedVote(prev => ({ ...prev, [itemId]: null }));
      setComments(prev => ({ ...prev, [itemId]: '' }));

    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o voto.",
        variant: "destructive"
      });
    }
  };

  const getApprovalPercentage = (votes: VotingItem['votes']) => {
    return votes.total > 0 ? (votes.approved / votes.total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Carregando votações...</p>
      </div>
    );
  }

  if (votingItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Não há itens para votação no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {votingItems.map((item) => (
        <Card key={item.id} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <div className="flex items-center space-x-2">
                {item.deadline && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(item.deadline).toLocaleDateString('pt-BR')}
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
              <p className="text-sm">{item.content}</p>
            </div>

            {/* Voting Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso da Votação</span>
                <span className="text-sm text-gray-600">
                  {item.votes.total} voto{item.votes.total !== 1 ? 's' : ''}
                </span>
              </div>
              
              <Progress value={getApprovalPercentage(item.votes)} className="w-full" />
              
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-green-600">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {item.votes.approved} aprovações
                </div>
                <div className="flex items-center text-red-600">
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {item.votes.rejected} rejeições
                </div>
              </div>
            </div>

            {/* Voting Interface */}
            {!item.userVote ? (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Seu Voto</h4>
                
                {/* Vote Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant={selectedVote[item.id] === 'approve' ? 'default' : 'outline'}
                    onClick={() => setSelectedVote(prev => ({ ...prev, [item.id]: 'approve' }))}
                    className="flex-1"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant={selectedVote[item.id] === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedVote(prev => ({ ...prev, [item.id]: 'reject' }))}
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
                    value={comments[item.id] || ''}
                    onChange={(e) => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Adicione um comentário sobre sua decisão..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Submit Vote */}
                <Button 
                  onClick={() => submitVote(item.id, item.type)}
                  disabled={!selectedVote[item.id]}
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
                      {item.userVote.vote_type === 'approve' ? 
                        <ThumbsUp className="w-6 h-6 mx-auto" /> : 
                        <ThumbsDown className="w-6 h-6 mx-auto" />
                      }
                    </div>
                    <p className="text-sm font-medium text-green-800">
                      Voto registrado com sucesso!
                    </p>
                    {item.userVote.comment && (
                      <p className="text-xs text-green-600 mt-1">
                        Comentário: "{item.userVote.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VotingCenter;
