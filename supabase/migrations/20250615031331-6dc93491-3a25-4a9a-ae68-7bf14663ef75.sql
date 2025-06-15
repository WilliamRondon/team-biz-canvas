
-- First drop the existing function to allow parameter name change
DROP FUNCTION IF EXISTS public.calculate_section_progress(uuid);

-- Recreate the calculate_section_progress function with proper parameter name
CREATE OR REPLACE FUNCTION public.calculate_section_progress(section_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  total_items INTEGER;
  approved_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items FROM canvas_items ci WHERE ci.section_id = section_id_param;
  SELECT COUNT(*) INTO approved_items FROM canvas_items ci WHERE ci.section_id = section_id_param AND ci.status = 'approved';
  
  IF total_items = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (approved_items * 100 / total_items);
END;
$function$;

-- Now recreate the get_business_plan_progress function
CREATE OR REPLACE FUNCTION public.get_business_plan_progress(plan_id uuid)
 RETURNS TABLE(overall_percentage integer, sections json)
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  section_data JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', cs.id,
      'title', cs.title,
      'progress', calculate_section_progress(cs.id),
      'total_items', (SELECT COUNT(*) FROM canvas_items ci WHERE ci.section_id = cs.id),
      'approved_items', (SELECT COUNT(*) FROM canvas_items ci WHERE ci.section_id = cs.id AND ci.status = 'approved')
    )
  ) INTO section_data
  FROM canvas_sections cs
  WHERE cs.business_plan_id = plan_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(
      (SELECT AVG(calculate_section_progress(cs.id))::INTEGER 
       FROM canvas_sections cs 
       WHERE cs.business_plan_id = plan_id), 
      0
    ) as overall_percentage,
    section_data as sections;
END;
$function$;

-- Fix the voting sessions function to properly join with user profiles
CREATE OR REPLACE FUNCTION public.get_voting_sessions_with_counts(business_plan_id_param uuid)
 RETURNS TABLE(id uuid, item_id uuid, item_type character varying, title character varying, content text, status character varying, deadline timestamp with time zone, total_votes bigint, approve_votes bigint, reject_votes bigint, user_vote character varying, user_comment text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    vs.id,
    vs.item_id,
    vs.item_type,
    vs.title,
    vs.content,
    vs.status,
    vs.deadline,
    COALESCE(vote_counts.total_votes, 0) as total_votes,
    COALESCE(vote_counts.approve_votes, 0) as approve_votes,
    COALESCE(vote_counts.reject_votes, 0) as reject_votes,
    user_votes.vote_type as user_vote,
    user_votes.comment as user_comment,
    vs.created_at
  FROM voting_sessions vs
  LEFT JOIN (
    SELECT 
      v.voting_session_id,
      COUNT(*) as total_votes,
      COUNT(CASE WHEN v.vote_type = 'approve' THEN 1 END) as approve_votes,
      COUNT(CASE WHEN v.vote_type = 'reject' THEN 1 END) as reject_votes
    FROM votes v
    GROUP BY v.voting_session_id
  ) vote_counts ON vs.id = vote_counts.voting_session_id
  LEFT JOIN votes user_votes ON vs.id = user_votes.voting_session_id AND user_votes.user_id = auth.uid()
  WHERE vs.business_plan_id = business_plan_id_param
    AND vs.status = 'active'
  ORDER BY vs.created_at DESC;
END;
$function$;
