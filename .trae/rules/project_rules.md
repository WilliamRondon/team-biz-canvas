# Business Plan Studio - Regras do Projeto

## Arquitetura e Tecnologias
- Use React 18+ com TypeScript estrito
- Implemente componentes funcionais com hooks
- Use Supabase para todas as operações de backend
- Mantenha Real-time WebSocket para colaboração
- Aplique Tailwind CSS + Shadcn/ui para styling

## Padrões de Colaboração Real-time
- Toda funcionalidade deve suportar múltiplos usuários simultâneos
- Implemente presença de usuários online via Supabase Realtime
- Use sistema de votação para aprovações colaborativas
- Mantenha histórico de mudanças em tempo real
- Aplique sistema de comentários threaded

## Segurança e RLS
- Valide permissões tanto no frontend quanto backend
- Use funções SECURITY DEFINER no PostgreSQL
- Implemente rate limiting nas Edge Functions
- Sanitize todas as entradas de usuário
- Aplique Row Level Security em todas as tabelas

## Estrutura de Componentes
- Organize por funcionalidade: /canvas, /detailed-sections, /voting
- Use hooks customizados para lógica de negócio
- Implemente error boundaries para componentes críticos
- Mantenha estado do servidor com React Query
- Use TypeScript interfaces para props

## Business Logic
- Canvas: 9 seções padrão do Business Model Canvas
- Seções Detalhadas: 18 seções organizadas em 4 categorias
- Estados: draft → voting → approved/rejected
- Dependências: Bloquear edição até dependências atendidas
- Progresso: Cálculo automático baseado em conteúdo
