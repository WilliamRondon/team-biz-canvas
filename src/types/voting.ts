// Definição de tipos para o sistema de votação

export interface VotingSession {
  id: string;
  item_id: string;
  item_type: string; // 'detailed_section' | 'canvas_item'
  title: string;
  content: string;
  status: string; // 'active' | 'completed'
  deadline: string;
  total_votes: number;
  approve_votes: number;
  reject_votes: number;
  user_vote?: string;
  user_comment?: string;
  created_at: string;
  business_plan_id: string;
}

export interface Vote {
  id: string;
  voting_session_id: string;
  user_id: string;
  vote_type: 'approve' | 'reject';
  comment?: string;
  created_at: string;
}