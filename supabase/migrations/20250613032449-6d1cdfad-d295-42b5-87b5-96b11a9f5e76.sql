
-- Primeiro, remover todas as políticas existentes que estão causando recursão
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

-- Criar função de segurança para verificar acesso a planos de negócios
CREATE OR REPLACE FUNCTION public.user_has_access_to_business_plan(plan_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE business_plan_id = plan_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$$;

-- Habilitar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas para companies
CREATE POLICY "Users can view their own companies"
ON companies FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Users can create companies"
ON companies FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own companies"
ON companies FOR UPDATE
USING (created_by = auth.uid());

-- Políticas para business_plans
CREATE POLICY "Users can access their business plans"
ON business_plans FOR ALL
USING (created_by = auth.uid() OR public.user_has_access_to_business_plan(id));

-- Políticas para team_members
CREATE POLICY "Team members can view team info"
ON team_members FOR SELECT
USING (user_id = auth.uid() OR public.user_has_access_to_business_plan(business_plan_id));

CREATE POLICY "Users can manage team members in their plans"
ON team_members FOR ALL
USING (
  business_plan_id IN (
    SELECT id FROM business_plans WHERE created_by = auth.uid()
  )
);

-- Políticas para canvas_sections
CREATE POLICY "Users can access canvas sections"
ON canvas_sections FOR ALL
USING (public.user_has_access_to_business_plan(business_plan_id));

-- Políticas para canvas_items
CREATE POLICY "Users can access canvas items"
ON canvas_items FOR ALL
USING (
  section_id IN (
    SELECT id FROM canvas_sections 
    WHERE public.user_has_access_to_business_plan(business_plan_id)
  )
);

-- Políticas para item_votes
CREATE POLICY "Users can vote on accessible items"
ON item_votes FOR ALL
USING (
  item_id IN (
    SELECT ci.id FROM canvas_items ci
    JOIN canvas_sections cs ON ci.section_id = cs.id
    WHERE public.user_has_access_to_business_plan(cs.business_plan_id)
  )
);

-- Políticas para invitations
CREATE POLICY "Users can manage invitations for their plans"
ON invitations FOR ALL
USING (
  business_plan_id IN (
    SELECT id FROM business_plans WHERE created_by = auth.uid()
  )
);

-- Políticas para comments
CREATE POLICY "Users can access comments on accessible items"
ON comments FOR ALL
USING (
  item_id IN (
    SELECT ci.id FROM canvas_items ci
    JOIN canvas_sections cs ON ci.section_id = cs.id
    WHERE public.user_has_access_to_business_plan(cs.business_plan_id)
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
