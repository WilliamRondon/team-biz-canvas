
-- Primeiro, remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view companies they have access to" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Company creators can update their companies" ON companies;
DROP POLICY IF EXISTS "Users can access business plans they are members of" ON business_plans;
DROP POLICY IF EXISTS "Team members can view team information" ON team_members;
DROP POLICY IF EXISTS "Admin users can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team members can access canvas sections" ON canvas_sections;
DROP POLICY IF EXISTS "Team members can access canvas items" ON canvas_items;
DROP POLICY IF EXISTS "Team members can vote on items" ON item_votes;
DROP POLICY IF EXISTS "Admin users can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Team members can access comments" ON comments;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Recriar as políticas RLS
CREATE POLICY "Users can view companies they have access to"
ON companies FOR SELECT
USING (
  id IN (
    SELECT c.id 
    FROM companies c
    JOIN business_plans bp ON c.id = bp.company_id
    JOIN team_members tm ON bp.id = tm.business_plan_id
    WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  )
  OR created_by = auth.uid()
);

CREATE POLICY "Users can create companies"
ON companies FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Company creators can update their companies"
ON companies FOR UPDATE
USING (created_by = auth.uid());

-- Políticas para business_plans
CREATE POLICY "Users can access business plans they are members of"
ON business_plans FOR ALL
USING (
  id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR created_by = auth.uid()
);

-- Políticas para team_members
CREATE POLICY "Team members can view team information"
ON team_members FOR SELECT
USING (
  business_plan_id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Admin users can manage team members"
ON team_members FOR ALL
USING (
  business_plan_id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
  )
);

-- Políticas para canvas_sections
CREATE POLICY "Team members can access canvas sections"
ON canvas_sections FOR ALL
USING (
  business_plan_id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Políticas para canvas_items
CREATE POLICY "Team members can access canvas items"
ON canvas_items FOR ALL
USING (
  section_id IN (
    SELECT cs.id 
    FROM canvas_sections cs
    JOIN business_plans bp ON cs.business_plan_id = bp.id
    JOIN team_members tm ON bp.id = tm.business_plan_id
    WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  )
);

-- Políticas para item_votes
CREATE POLICY "Team members can vote on items"
ON item_votes FOR ALL
USING (
  item_id IN (
    SELECT ci.id 
    FROM canvas_items ci
    JOIN canvas_sections cs ON ci.section_id = cs.id
    JOIN business_plans bp ON cs.business_plan_id = bp.id
    JOIN team_members tm ON bp.id = tm.business_plan_id
    WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  )
);

-- Políticas para invitations
CREATE POLICY "Admin users can manage invitations"
ON invitations FOR ALL
USING (
  business_plan_id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner') AND status = 'active'
  )
);

-- Políticas para comments
CREATE POLICY "Team members can access comments"
ON comments FOR ALL
USING (
  item_id IN (
    SELECT ci.id 
    FROM canvas_items ci
    JOIN canvas_sections cs ON ci.section_id = cs.id
    JOIN business_plans bp ON cs.business_plan_id = bp.id
    JOIN team_members tm ON bp.id = tm.business_plan_id
    WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  )
);

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (id = auth.uid());
