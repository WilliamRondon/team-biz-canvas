# Agent Context - Business Plan Studio

## Função do Agente
O agente atua como orquestrador do fluxo de desenvolvimento colaborativo, integrando-se ao Supabase (banco e canais realtime) e ao servidor MCP de memória persistente.

## Fluxo de Trabalho
1. **Leitura de Documentação:** Sempre analise os arquivos `@/prd_enhanced_canvas_editor.md` e `@/task_plan_canvas.md` antes de sugerir ou executar alterações.
2. **Alteração de Funcionalidade:** Ao modificar qualquer funcionalidade, registre a mudança na memória MCP e notifique o Coderabbit para revisão automática.
3. **Revisão Coderabbit:** Aguarde o relatório do Coderabbit. Se houver erros, reaja conforme as recomendações. Se aprovado, avance para a próxima tarefa.
4. **Persistência de Contexto:** Todas as decisões, progresso e bloqueios devem ser registrados no MCP para continuidade entre sessões.

## Integração com Supabase e MCP
- Use sempre o canal `canvas-collaboration:{business_plan_id}` para eventos de colaboração.
- Salve e recupere contexto técnico e de usuários via MCP.
- Utilize o feedback do Coderabbit para atualizar a memória do projeto e orientar próximos passos.

## Exemplo de Fluxo
1. Agente propõe alteração → Atualiza documentação → Notifica Coderabbit.
2. Coderabbit revisa e retorna feedback.
3. Agente executa correções ou avança.
4. Todo o histórico é salvo no MCP.




# Business Plan Studio - Agent Context

## 1. Visão Geral do Projeto

Este documento serve como um contexto centralizado para agentes de IA e desenvolvedores que trabalham no projeto Business Plan Studio. Ele conecta a documentação de alto nível, os planos de tarefas e o estado atual do código-fonte.

**Objetivo Principal do Projeto:** Criar uma plataforma colaborativa em tempo real para o desenvolvimento de planos de negócios, utilizando o Business Model Canvas e seções detalhadas.

**Stack Tecnológico Principal:**
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Estado:** TanStack React Query
- **UI:** Shadcn/ui

---

## 2. Mapeamento de Conceitos para Arquivos

Use esta seção para encontrar rapidamente os arquivos relevantes para cada funcionalidade principal.

### 2.1. Colaboração Real-Time no Canvas

- **Status Atual:** **Implementação Parcial.** O frontend está desenvolvido, mas o backend (schema do DB) está pendente.
- **Funcionalidade:** Edição simultânea do Business Model Canvas, com presença de usuários, cursores ao vivo e bloqueio de itens.
- **Documentação de Referência:**
  - **PRD:** [`prd_enhanced_canvas_editor.md`](prd_enhanced_canvas_editor.md)
  - **Plano de Tarefas:** [`task_plan_canvas.md`](task_plan_canvas.md)
- **Arquivos Chave:**
  - **Hook Principal (Lógica Real-Time):** [`src/hooks/useRealtimeCanvas.ts`](src/hooks/useRealtimeCanvas.ts:1) - Contém toda a lógica de conexão com canais Supabase, manipulação de presença e eventos de item.
  - **Componente de UI:** [`src/components/CanvasEditor.tsx`](src/components/CanvasEditor.tsx:1) - Implementa a UI para o canvas, consome o hook `useRealtimeCanvas` e renderiza os elementos visuais de colaboração.
  - **Tipos de Dados:** [`src/integrations/supabase/types.ts`](src/integrations/supabase/types.ts) - Define as interfaces TypeScript para eventos e dados do canvas.
  - **Migrações de Banco de Dados:** `supabase/migrations/` - **Ação Necessária:** Nenhuma migração existente implementa o schema de bloqueio. Uma nova migração é necessária para adicionar as colunas `locked_by` e `locked_at` à tabela `canvas_items`.

### 2.2. Sistema de Votação

- **Status Atual:** Implementado.
- **Funcionalidade:** Permite que os membros da equipe votem em itens do canvas e seções detalhadas.
- **Arquivos Chave:**
  - **Componente de UI (Votação):** [`src/components/VotingInterface.tsx`](src/components/VotingInterface.tsx:1)
  - **Componente de UI (Centro de Votação):** [`src/components/RealVotingCenter.tsx`](src/components/RealVotingCenter.tsx:1)
  - **Hook (Resultados):** [`src/hooks/useRealtimeVotingResults.tsx`](src/hooks/useRealtimeVotingResults.tsx:1)
  - **Funções do Banco de Dados:**
    - `create_voting_session_from_canvas_item`
    - `create_voting_session_from_section`
    - `get_voting_sessions_with_counts`
    (Verificar arquivos em `supabase/migrations/` para a lógica completa).

### 2.3. Autenticação e Perfis de Usuário

- **Status Atual:** Implementado.
- **Funcionalidade:** Gerencia o login, registro e perfis de usuário.
- **Arquivos Chave:**
  - **Hook de Autenticação:** [`src/hooks/useAuth.tsx`](src/hooks/useAuth.tsx:1)
  - **Página de Autenticação:** [`src/pages/Auth.tsx`](src/pages/Auth.tsx:1)
  - **Tabelas do DB:** `auth.users`, `public.user_profiles`

---

## 3. Estado Atual do Desenvolvimento e Próximos Passos

### Análise do Momento Atual

1.  **Funcionalidade de Bloqueio (Locking) Incompleta:** A tarefa de implementação do "Enhanced Canvas Editor" está bloqueada. O frontend ([`useRealtimeCanvas.ts`](src/hooks/useRealtimeCanvas.ts:1) e [`CanvasEditor.tsx`](src/components/CanvasEditor.tsx:1)) foi desenvolvido para usar um sistema de bloqueio (`lockItem`, `unlockItem`), mas as colunas necessárias (`locked_by`, `locked_at`) não existem na tabela `canvas_items`.
2.  **Qualidade de Código:** O arquivo [`.coderabbit.yaml`](.coderabbit.yaml) está configurado para garantir que as novas implementações sigam os padrões de qualidade, especialmente em relação à segurança (RLS) e ao gerenciamento de canais real-time.
3.  **Configuração do Ambiente:** O arquivo `.trae/mcp.json` confirma que o ambiente de desenvolvimento está preparado para interagir com o Supabase.

### Próximas Ações Recomendadas para o Agente

1.  **Criar a Migração do Banco de Dados:**
    - **Tarefa:** Gerar um novo arquivo de migração SQL na pasta `supabase/migrations/`.
    - **Conteúdo:** O SQL deve conter o comando `ALTER TABLE public.canvas_items` para adicionar as colunas `locked_by` (UUID, com referência a `auth.users`) e `locked_at` (TIMESTAMPTZ), conforme especificado em [`prd_enhanced_canvas_editor.md`](prd_enhanced_canvas_editor.md:86).
    - **Justificativa:** Esta é a dependência crítica que impede o progresso da funcionalidade de colaboração em tempo real.

2.  **Implementar a Política de Segurança (RLS) para Bloqueio:**
    - **Tarefa:** Adicionar a política de RLS na mesma migração SQL.
    - **Conteúdo:** A política deve garantir que um usuário só possa bloquear/desbloquear um item se for membro do plano de negócios correspondente, conforme o exemplo em [`prd_enhanced_canvas_editor.md`](prd_enhanced_canvas_editor.md:91).
    - **Justificativa:** Garante a segurança e a integridade dos dados no processo de edição colaborativa.

3.  **Validar a Funcionalidade de Ponta a Ponta:**
    - **Tarefa:** Após a aplicação da migração, testar o fluxo completo de bloqueio e edição de um item do canvas.
    - **Passos:**
        1.  Um usuário tenta editar um item.
        2.  Verificar se a função `lockItem` em [`useRealtimeCanvas.ts`](src/hooks/useRealtimeCanvas.ts:79) é executada com sucesso.
        3.  Verificar no banco de dados se as colunas `locked_by` e `locked_at` foram preenchidas.
        4.  Outro usuário tenta editar o mesmo item e deve ser impedido pela UI em [`CanvasEditor.tsx`](src/components/CanvasEditor.tsx:1).
        5.  O primeiro usuário salva ou cancela a edição, e a função `unlockItem` é chamada, limpando as colunas no banco de dados.
