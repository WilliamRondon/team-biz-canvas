
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeVotingSessions = (businessPlanId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!businessPlanId) return;

    console.log('Setting up realtime for voting sessions...');

    const votingSessionsChannel = supabase
      .channel('voting_sessions_changes')
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
          onUpdate();
        }
      )
      .subscribe();

    const votesChannel = supabase
      .channel('votes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          console.log('Votes changed:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votingSessionsChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [businessPlanId, onUpdate]);
};
