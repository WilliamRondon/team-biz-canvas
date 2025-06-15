
-- Create table for voting sessions (detailed sections and canvas items)
CREATE TABLE public.voting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL, -- Can reference canvas_items or detailed_sections
  item_type VARCHAR NOT NULL CHECK (item_type IN ('canvas_item', 'detailed_section')),
  business_plan_id UUID NOT NULL REFERENCES business_plans(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voting_session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type VARCHAR NOT NULL CHECK (vote_type IN ('approve', 'reject')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate votes
ALTER TABLE public.votes ADD CONSTRAINT unique_user_vote_per_session 
UNIQUE (voting_session_id, user_id);

-- Enable RLS on voting_sessions
ALTER TABLE public.voting_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for voting_sessions - users can see sessions for their business plans
CREATE POLICY "Users can view voting sessions for their business plans" 
  ON public.voting_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE business_plan_id = voting_sessions.business_plan_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Policy for creating voting sessions
CREATE POLICY "Team members can create voting sessions" 
  ON public.voting_sessions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE business_plan_id = voting_sessions.business_plan_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Policy for updating voting sessions
CREATE POLICY "Team members can update voting sessions" 
  ON public.voting_sessions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE business_plan_id = voting_sessions.business_plan_id 
      AND user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Policy for votes - users can see votes for sessions they have access to
CREATE POLICY "Users can view votes for accessible sessions" 
  ON public.votes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM voting_sessions vs
      JOIN team_members tm ON vs.business_plan_id = tm.business_plan_id
      WHERE vs.id = votes.voting_session_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- Policy for creating votes
CREATE POLICY "Team members can vote" 
  ON public.votes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voting_sessions vs
      JOIN team_members tm ON vs.business_plan_id = tm.business_plan_id
      WHERE vs.id = votes.voting_session_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- Policy for updating own votes
CREATE POLICY "Users can update their own votes" 
  ON public.votes 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Function to get voting sessions with vote counts
CREATE OR REPLACE FUNCTION get_voting_sessions_with_counts(business_plan_id_param UUID)
RETURNS TABLE(
  id UUID,
  item_id UUID,
  item_type VARCHAR,
  title VARCHAR,
  content TEXT,
  status VARCHAR,
  deadline TIMESTAMP WITH TIME ZONE,
  total_votes BIGINT,
  approve_votes BIGINT,
  reject_votes BIGINT,
  user_vote VARCHAR,
  user_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
      voting_session_id,
      COUNT(*) as total_votes,
      COUNT(CASE WHEN vote_type = 'approve' THEN 1 END) as approve_votes,
      COUNT(CASE WHEN vote_type = 'reject' THEN 1 END) as reject_votes
    FROM votes 
    GROUP BY voting_session_id
  ) vote_counts ON vs.id = vote_counts.voting_session_id
  LEFT JOIN votes user_votes ON vs.id = user_votes.voting_session_id AND user_votes.user_id = auth.uid()
  WHERE vs.business_plan_id = business_plan_id_param
    AND vs.status = 'active'
  ORDER BY vs.created_at DESC;
END;
$$;

-- Function to create voting session from detailed section
CREATE OR REPLACE FUNCTION create_voting_session_from_section(section_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
  section_record RECORD;
BEGIN
  -- Get section details
  SELECT ds.id, ds.title, ds.content, ds.business_plan_id
  INTO section_record
  FROM detailed_sections ds
  WHERE ds.id = section_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Section not found';
  END IF;

  -- Create voting session
  INSERT INTO voting_sessions (item_id, item_type, business_plan_id, title, content, created_by)
  VALUES (
    section_record.id, 
    'detailed_section', 
    section_record.business_plan_id, 
    section_record.title, 
    section_record.content,
    auth.uid()
  )
  RETURNING id INTO session_id;

  -- Update section status to voting
  UPDATE detailed_sections 
  SET status = 'voting', updated_at = now()
  WHERE id = section_id_param;

  RETURN session_id;
END;
$$;

-- Function to create voting session from canvas item
CREATE OR REPLACE FUNCTION create_voting_session_from_canvas_item(item_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
  item_record RECORD;
BEGIN
  -- Get item details
  SELECT ci.id, ci.content, cs.title, cs.business_plan_id
  INTO item_record
  FROM canvas_items ci
  JOIN canvas_sections cs ON ci.section_id = cs.id
  WHERE ci.id = item_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Canvas item not found';
  END IF;

  -- Create voting session
  INSERT INTO voting_sessions (item_id, item_type, business_plan_id, title, content, created_by)
  VALUES (
    item_record.id, 
    'canvas_item', 
    item_record.business_plan_id, 
    item_record.title, 
    item_record.content,
    auth.uid()
  )
  RETURNING id INTO session_id;

  -- Update canvas item status to voting
  UPDATE canvas_items 
  SET status = 'voting', updated_at = now()
  WHERE id = item_id_param;

  RETURN session_id;
END;
$$;

-- Add update triggers for updated_at
CREATE TRIGGER update_voting_sessions_updated_at 
  BEFORE UPDATE ON voting_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
