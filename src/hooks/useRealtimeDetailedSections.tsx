
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeDetailedSections = (businessPlanId: string, onUpdate: () => void) => {
  useEffect(() => {
    if (!businessPlanId) return;

    const channel = supabase
      .channel(`detailed_sections_changes_${businessPlanId}_${Date.now()}`)
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
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessPlanId, onUpdate]);
};
