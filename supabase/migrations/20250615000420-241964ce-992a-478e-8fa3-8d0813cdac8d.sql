
-- Criar tabela para seções detalhadas do plano de negócios
CREATE TABLE public.detailed_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_plan_id uuid REFERENCES business_plans(id) ON DELETE CASCADE,
  category varchar(50) NOT NULL, -- 'conceito', 'pesquisa', 'configuracao', 'projecoes'
  section_key varchar(100) NOT NULL, -- chave única para a seção
  title varchar(255) NOT NULL,
  description text,
  content text DEFAULT '',
  status varchar(20) DEFAULT 'draft', -- 'draft', 'voting', 'approved', 'rejected'
  assigned_to uuid REFERENCES auth.users(id),
  deadline timestamp with time zone,
  progress_percentage integer DEFAULT 0,
  dependencies text[], -- array de section_keys que são dependências
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT detailed_sections_pkey PRIMARY KEY (id),
  CONSTRAINT detailed_sections_unique_per_plan UNIQUE (business_plan_id, section_key)
);

-- Habilitar RLS
ALTER TABLE public.detailed_sections ENABLE ROW LEVEL SECURITY;

-- Política RLS para detailed_sections
CREATE POLICY "Team members can access detailed sections"
ON detailed_sections FOR ALL
USING (
  business_plan_id IN (
    SELECT business_plan_id 
    FROM team_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Função para criar seções detalhadas padrão
CREATE OR REPLACE FUNCTION create_default_detailed_sections(plan_id uuid)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Atualizar a função create_default_canvas_sections para também criar seções detalhadas
CREATE OR REPLACE FUNCTION create_default_canvas_sections(plan_id uuid)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela detailed_sections
CREATE TRIGGER update_detailed_sections_updated_at
  BEFORE UPDATE ON detailed_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar realtime para detailed_sections
ALTER PUBLICATION supabase_realtime ADD TABLE detailed_sections;
ALTER TABLE detailed_sections REPLICA IDENTITY FULL;

-- Função para calcular progresso das seções detalhadas
CREATE OR REPLACE FUNCTION calculate_detailed_section_progress(business_plan_id_param uuid)
RETURNS TABLE (
  category varchar(50),
  total_sections integer,
  approved_sections integer,
  progress_percentage integer
) AS $$
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
$$ LANGUAGE plpgsql;
