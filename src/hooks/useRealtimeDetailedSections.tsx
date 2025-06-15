
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeDetailedSections = (businessPlanId: string, onUpdate: () => void) => {
  // Use ref to store the callback to avoid it being a dependency
  const onUpdateRef = useRef(onUpdate);
  
  // Update ref when callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!businessPlanId) return;

    // Use static channel name instead of dynamic one with Date.now()
    const channel = supabase
      .channel(`detailed_sections_${businessPlanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'detailed_sections',
          filter: `business_plan_id=eq.${businessPlanId}`,
        },
        (payload) => {
          console.log('Detailed sections changed:', payload);
          onUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessPlanId]); // Only depend on businessPlanId
};
