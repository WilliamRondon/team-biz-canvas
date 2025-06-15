
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeVotingSessions = (businessPlanId: string, onUpdate: () => void) => {
  // Use ref to store the callback to avoid it being a dependency
  const onUpdateRef = useRef(onUpdate);
  const channelsRef = useRef<any[]>([]);
  
  // Update ref when callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!businessPlanId) return;

    // Clean up any existing channels first
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Use static channel names instead of dynamic ones with Date.now()
    const votingSessionsChannel = supabase
      .channel(`voting_sessions_${businessPlanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voting_sessions',
          filter: `business_plan_id=eq.${businessPlanId}`,
        },
        (payload) => {
          console.log('Voting sessions changed:', payload);
          onUpdateRef.current();
        }
      );

    const votesChannel = supabase
      .channel(`votes_${businessPlanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        async (payload) => {
          console.log('Votes changed:', payload);
          
          // Check if this vote completes the voting session
          if (payload.eventType === 'INSERT') {
            await checkAndCompleteVoting(payload.new.voting_session_id);
          }
          
          onUpdateRef.current();
        }
      );

    // Subscribe to channels
    votingSessionsChannel.subscribe();
    votesChannel.subscribe();

    // Store channels in ref for cleanup
    channelsRef.current = [votingSessionsChannel, votesChannel];

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [businessPlanId]); // Only depend on businessPlanId
};

const processVotingResults = async (votingSessionId: string) => {
  try {
    // Get voting session details and vote counts
    const { data: sessionData, error: sessionError } = await supabase
      .from('voting_sessions')
      .select('item_id, item_type')
      .eq('id', votingSessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Error getting session data:', sessionError);
      return;
    }

    const { data: voteCounts, error: voteError } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('voting_session_id', votingSessionId);

    if (voteError) {
      console.error('Error getting vote counts:', voteError);
      return;
    }

    const approveVotes = voteCounts.filter(v => v.vote_type === 'approve').length;
    const rejectVotes = voteCounts.filter(v => v.vote_type === 'reject').length;
    const totalVotes = voteCounts.length;

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

    console.log(`Item ${sessionData.item_id} ${newStatus} based on voting results`);

  } catch (error) {
    console.error('Error processing voting results:', error);
  }
};

const checkAndCompleteVoting = async (votingSessionId: string) => {
  try {
    // Get total team members for this business plan
    const { data: sessionData } = await supabase
      .from('voting_sessions')
      .select('business_plan_id')
      .eq('id', votingSessionId)
      .single();

    if (!sessionData) return;

    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('business_plan_id', sessionData.business_plan_id)
      .eq('status', 'active');

    const { data: votes } = await supabase
      .from('votes')
      .select('id')
      .eq('voting_session_id', votingSessionId);

    const totalTeamMembers = teamMembers?.length || 1;
    const totalVotes = votes?.length || 0;

    // Complete voting if all team members have voted or if we have enough votes
    if (totalVotes >= totalTeamMembers || totalVotes >= 1) {
      const { error } = await supabase
        .from('voting_sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', votingSessionId);

      if (!error) {
        await processVotingResults(votingSessionId);
      }
    }

  } catch (error) {
    console.error('Error checking voting completion:', error);
  }
};
