
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { VotingSession } from '../types/voting';

interface UseRealtimeVotingSessionsProps {
  businessPlanId: string;
  onUpdate?: () => void;
}

interface VoteCountsResult {
  approve_votes: number;
  reject_votes: number;
  total_votes: number;
}

export function useRealtimeVotingSessions(businessPlanId: string, onUpdate?: () => void) {
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTeamMembers, setActiveTeamMembers] = useState(0);

  // Use refs to avoid stale closures in event handlers
  const onUpdateRef = useRef(onUpdate);
  const votingSessionsChannelRef = useRef<RealtimeChannel | null>(null);
  const votesChannelRef = useRef<RealtimeChannel | null>(null);
  
  // Update ref when prop changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Fetch active team members count
  useEffect(() => {
    async function fetchActiveTeamMembers() {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('business_plan_id', businessPlanId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setActiveTeamMembers(data.length);
    }

    fetchActiveTeamMembers();
  }, [businessPlanId]);

  // Fetch voting sessions
  useEffect(() => {
    async function fetchVotingSessions() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .rpc('get_voting_sessions_with_counts', { business_plan_id_param: businessPlanId });

        if (error) throw error;
        
        // Adicionar o business_plan_id aos dados retornados
        const sessionsWithBusinessPlanId = (data || []).map(session => ({
          ...session,
          business_plan_id: businessPlanId
        }));
        
        setVotingSessions(sessionsWithBusinessPlanId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching voting sessions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVotingSessions();
  }, [businessPlanId]);

  // Process voting results
  async function processVotingResults(votingSessionId: string) {
    const { data: sessionData, error: sessionError } = await supabase
      .from('voting_sessions')
      .select('item_id, item_type')
      .eq('id', votingSessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Error getting session data:', sessionError);
      return;
    }

    const { data: counts, error: voteError } = await supabase
      .rpc('get_vote_counts', { voting_session_id_param: votingSessionId });

    if (voteError || !counts) {
      console.error('Error getting vote counts:', voteError);
      return;
    }

    const approveVotes = Number(counts.approve_votes) || 0;
    const rejectVotes = Number(counts.reject_votes) || 0;
    const totalVotes = approveVotes + rejectVotes;

    // Determine if approved (simple majority for now)
    const isApproved = approveVotes > rejectVotes && totalVotes >= 1;
    const newStatus = isApproved ? 'approved' : 'rejected';

    // Update the corresponding item based on type
    if (sessionData.item_type === 'detailed_section') {
      const { error: updateError } = await supabase
        .from('detailed_sections')
        .update({ 
          status: newStatus,
          progress_percentage: isApproved ? 100 : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.item_id);

      if (updateError) {
        console.error('Error updating detailed section:', updateError);
      }
    } else if (sessionData.item_type === 'canvas_item') {
      const { error: updateError } = await supabase
        .from('canvas_items')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.item_id);

      if (updateError) {
        console.error('Error updating canvas item:', updateError);
      }
    }

    // Update voting session status
    const { error: sessionUpdateError } = await supabase
      .from('voting_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', votingSessionId);

    if (sessionUpdateError) {
      console.error('Error updating voting session:', sessionUpdateError);
    }
  }

  // Check if voting should be completed
  const checkAndCompleteVoting = useCallback(async (votingSessionId: string) => {
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id')
      .eq('voting_session_id', votingSessionId);

    if (votesError) {
      console.error('Error checking votes:', votesError);
      return;
    }

    // If all active team members have voted, complete the voting
    if (votes && votes.length >= activeTeamMembers && activeTeamMembers > 0) {
      await processVotingResults(votingSessionId);
    }
  }, [activeTeamMembers]);

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to voting_sessions table
    const votingSessionsChannel = supabase
      .channel('voting_sessions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'voting_sessions',
        filter: `business_plan_id=eq.${businessPlanId}`
      }, (payload) => {
        console.log('Voting session changed:', payload);
        if (onUpdateRef.current) onUpdateRef.current();
      })
      .subscribe();

    // Subscribe to votes table
    const votesChannel = supabase
      .channel('votes_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'votes'
      }, (payload) => {
        console.log('New vote:', payload);
        // Check if this vote completes the voting process
        if (payload.new && payload.new.voting_session_id) {
          checkAndCompleteVoting(payload.new.voting_session_id);
        }
        if (onUpdateRef.current) onUpdateRef.current();
      })
      .subscribe();

    votingSessionsChannelRef.current = votingSessionsChannel;
    votesChannelRef.current = votesChannel;

    return () => {
      votingSessionsChannel.unsubscribe();
      votesChannel.unsubscribe();
    };
  }, [businessPlanId, checkAndCompleteVoting]);

  return { votingSessions, loading, error };
}
