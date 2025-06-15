-- Add the missing get_vote_counts function
CREATE OR REPLACE FUNCTION public.get_vote_counts(voting_session_id_param uuid)
 RETURNS TABLE(approve_votes bigint, reject_votes bigint, total_votes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN vote_type = 'approve' THEN 1 END) as approve_votes,
    COUNT(CASE WHEN vote_type = 'reject' THEN 1 END) as reject_votes,
    COUNT(*) as total_votes
  FROM votes
  WHERE voting_session_id = voting_session_id_param;
END;
$function$;