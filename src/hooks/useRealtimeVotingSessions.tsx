
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeVotingSessions = (businessPlanId: string, onUpdate: () => void) => {
  // Use ref to store the callback to avoid it being a dependency
  const onUpdateRef = useRef(onUpdate);
  
  // Update ref when callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!businessPlanId) return;

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
      )
      .subscribe();

    const votesChannel = supabase
      .channel(`votes_${businessPlanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          console.log('Votes changed:', payload);
          onUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votingSessionsChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [businessPlanId]); // Only depend on businessPlanId
};
