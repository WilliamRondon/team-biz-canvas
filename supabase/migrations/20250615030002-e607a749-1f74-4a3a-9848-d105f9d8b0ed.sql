
-- Fix all database functions by setting proper search_path for security

-- Update create_default_detailed_sections function
CREATE OR REPLACE FUNCTION public.create_default_detailed_sections(plan_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO detailed_sections (business_plan_id, category, section_key, title, description, dependencies) VALUES
  -- Conceito
  (plan_id, 'conceito', 'resumo-executivo', 'Resumo Executivo', 'Visão geral do negócio', NULL),
  (plan_id, 'conceito', 'missao-visao', 'Missão, Visão e Valores', 'Definição dos princípios da empresa', NULL),
  (plan_id, 'conceito', 'objetivos-estrategicos', 'Objetivos Estratégicos', 'Metas e objetivos de longo prazo', ARRAY['missao-visao']),
  (plan_id, 'conceito', 'modelo-negocio', 'Modelo de Negócio', 'Descrição detalhada do modelo', NULL),
  
  -- Pesquisa
  (plan_id, 'pesquisa', 'analise-mercado', 'Análise de Mercado', 'Estudo do mercado-alvo', NULL),
  (plan_id, 'pesquisa', 'personas', 'Personas de Cliente', 'Perfil dos clientes ideais', NULL),
  (plan_id, 'pesquisa', 'analise-concorrencia', 'Análise da Concorrência', 'Estudo dos concorrentes', ARRAY['analise-mercado']),
  (plan_id, 'pesquisa', 'tendencias-mercado', 'Tendências de Mercado', 'Análise de tendências futuras', NULL),
  
  -- Configuração
  (plan_id, 'configuracao', 'estrutura-organizacional', 'Estrutura Organizacional', 'Organização da empresa', NULL),
  (plan_id, 'configuracao', 'plano-operacional', 'Plano Operacional', 'Operações do dia-a-dia', ARRAY['estrutura-organizacional']),
  (plan_id, 'configuracao', 'recursos-humanos', 'Recursos Humanos', 'Planejamento de pessoal', NULL),
  (plan_id, 'configuracao', 'tecnologia-sistemas', 'Tecnologia e Sistemas', 'Infraestrutura tecnológica', NULL),
  (plan_id, 'configuracao', 'localizacao-infraestrutura', 'Localização e Infraestrutura', 'Instalações físicas', NULL),
  
  -- Projeções
  (plan_id, 'projecoes', 'analise-financeira', 'Análise Financeira', 'Projeções financeiras', NULL),
  (plan_id, 'projecoes', 'projecoes-receita', 'Projeções de Receita', 'Estimativas de faturamento', ARRAY['analise-mercado', 'personas']),
  (plan_id, 'projecoes', 'analise-riscos', 'Análise de Riscos', 'Identificação e mitigação de riscos', NULL),
  (plan_id, 'projecoes', 'plano-investimentos', 'Plano de Investimentos', 'Necessidades de investimento', NULL),
  (plan_id, 'projecoes', 'analise-viabilidade', 'Análise de Viabilidade', 'Estudo de viabilidade econômica', ARRAY['analise-financeira', 'analise-riscos']);
END;
$function$;

-- Update create_default_canvas_sections function
CREATE OR REPLACE FUNCTION public.create_default_canvas_sections(plan_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  -- Criar seções do canvas
  INSERT INTO canvas_sections (business_plan_id, section_type, title, description, sort_order) VALUES
  (plan_id, 'key_partners', 'Parceiros-Chave', 'Quem são os seus principais parceiros e fornecedores?', 1),
  (plan_id, 'key_activities', 'Atividades-Chave', 'Quais são as atividades mais importantes para o sucesso do seu negócio?', 2),
  (plan_id, 'key_resources', 'Recursos-Chave', 'Quais recursos são essenciais para seu modelo de negócio?', 3),
  (plan_id, 'value_propositions', 'Proposta de Valor', 'Qual valor único você oferece aos seus clientes?', 4),
  (plan_id, 'customer_relationships', 'Relacionamento com Clientes', 'Como você se relaciona com seus clientes?', 5),
  (plan_id, 'channels', 'Canais', 'Como você alcança e entrega valor aos seus clientes?', 6),
  (plan_id, 'customer_segments', 'Segmentos de Clientes', 'Quem são seus clientes mais importantes?', 7),
  (plan_id, 'cost_structure', 'Estrutura de Custos', 'Quais são os custos mais importantes do seu modelo?', 8),
  (plan_id, 'revenue_streams', 'Fontes de Receita', 'Como você gera receita com cada segmento?', 9);
  
  -- Criar seções detalhadas
  PERFORM create_default_detailed_sections(plan_id);
END;
$function$;

-- Update calculate_detailed_section_progress function
CREATE OR REPLACE FUNCTION public.calculate_detailed_section_progress(business_plan_id_param uuid)
 RETURNS TABLE(category character varying, total_sections integer, approved_sections integer, progress_percentage integer)
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ds.category,
    COUNT(*)::integer as total_sections,
    COUNT(CASE WHEN ds.status = 'approved' THEN 1 END)::integer as approved_sections,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE (COUNT(CASE WHEN ds.status = 'approved' THEN 1 END) * 100 / COUNT(*))::integer
    END as progress_percentage
  FROM detailed_sections ds
  WHERE ds.business_plan_id = business_plan_id_param
  GROUP BY ds.category;
END;
$function$;

-- Update get_voting_sessions_with_counts function
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
$function$;

-- Update create_voting_session_from_section function
CREATE OR REPLACE FUNCTION public.create_voting_session_from_section(section_id_param uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
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
$function$;

-- Update create_voting_session_from_canvas_item function
CREATE OR REPLACE FUNCTION public.create_voting_session_from_canvas_item(item_id_param uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
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
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update calculate_section_progress function
CREATE OR REPLACE FUNCTION public.calculate_section_progress(section_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  total_items INTEGER;
  approved_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_items FROM canvas_items WHERE section_id = calculate_section_progress.section_id;
  SELECT COUNT(*) INTO approved_items FROM canvas_items WHERE section_id = calculate_section_progress.section_id AND status = 'approved';
  
  IF total_items = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN (approved_items * 100 / total_items);
END;
$function$;

-- Update get_business_plan_progress function
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
      'total_items', (SELECT COUNT(*) FROM canvas_items WHERE section_id = cs.id),
      'approved_items', (SELECT COUNT(*) FROM canvas_items WHERE section_id = cs.id AND status = 'approved')
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

-- Update user_has_access_to_business_plan function
CREATE OR REPLACE FUNCTION public.user_has_access_to_business_plan(plan_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE business_plan_id = plan_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$function$;
