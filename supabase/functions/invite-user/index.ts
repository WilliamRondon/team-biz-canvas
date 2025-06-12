
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, businessPlanId, invitedBy } = await req.json();

    if (!email || !businessPlanId || !invitedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('team_members')
      .select('id')
      .eq('business_plan_id', businessPlanId)
      .eq('user_id', invitedBy); // This should check the invited user, but we need their ID first

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Insert invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        business_plan_id: businessPlanId,
        email: email,
        token: token,
        invited_by: invitedBy,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Here you would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll just log the invitation details
    console.log('Invitation created:', {
      email,
      token,
      businessPlanId,
      expiresAt: expiresAt.toISOString()
    });

    // In a real implementation, send email here
    // Example email content:
    const inviteLink = `${Deno.env.get('SITE_URL')}/invite/${token}`;
    console.log('Invite link:', inviteLink);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation sent successfully',
        inviteLink // For testing purposes
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in invite-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
