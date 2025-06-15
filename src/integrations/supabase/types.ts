export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_plans: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          progress_percentage: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          progress_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_items: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          section_id: string | null
          status: string | null
          updated_at: string | null
          workspace_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          workspace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "canvas_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_sections: {
        Row: {
          business_plan_id: string | null
          description: string | null
          id: string
          section_type: string
          sort_order: number | null
          title: string
        }
        Insert: {
          business_plan_id?: string | null
          description?: string | null
          id?: string
          section_type: string
          sort_order?: number | null
          title: string
        }
        Update: {
          business_plan_id?: string | null
          description?: string | null
          id?: string
          section_type?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_sections_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          item_id: string | null
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "canvas_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          legal_name: string | null
          name: string
          sector: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          legal_name?: string | null
          name: string
          sector?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          sector?: string | null
        }
        Relationships: []
      }
      detailed_sections: {
        Row: {
          assigned_to: string | null
          business_plan_id: string | null
          category: string
          content: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          dependencies: string[] | null
          description: string | null
          id: string
          progress_percentage: number | null
          section_key: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_plan_id?: string | null
          category: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          section_key: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_plan_id?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          section_key?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_sections_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          business_plan_id: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          status: string | null
          token: string
        }
        Insert: {
          business_plan_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          status?: string | null
          token: string
        }
        Update: {
          business_plan_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      item_votes: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          item_id: string | null
          user_id: string | null
          vote_type: string
          vote_value: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          user_id?: string | null
          vote_type: string
          vote_value?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          user_id?: string | null
          vote_type?: string
          vote_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_votes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "canvas_items"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          business_plan_id: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          business_plan_id?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          business_plan_id?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          user_id: string
          vote_type: string
          voting_session_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          user_id: string
          vote_type: string
          voting_session_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
          voting_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_voting_session_id_fkey"
            columns: ["voting_session_id"]
            isOneToOne: false
            referencedRelation: "voting_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_sessions: {
        Row: {
          business_plan_id: string
          content: string
          created_at: string
          created_by: string | null
          deadline: string | null
          id: string
          item_id: string
          item_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_plan_id: string
          content: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          item_id: string
          item_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_plan_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          id?: string
          item_id?: string
          item_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_sessions_business_plan_id_fkey"
            columns: ["business_plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_detailed_section_progress: {
        Args: { business_plan_id_param: string }
        Returns: {
          category: string
          total_sections: number
          approved_sections: number
          progress_percentage: number
        }[]
      }
      calculate_section_progress: {
        Args: { section_id_param: string }
        Returns: number
      }
      create_default_canvas_sections: {
        Args: { plan_id: string }
        Returns: undefined
      }
      create_default_detailed_sections: {
        Args: { plan_id: string }
        Returns: undefined
      }
      create_voting_session_from_canvas_item: {
        Args: { item_id_param: string }
        Returns: string
      }
      create_voting_session_from_section: {
        Args: { section_id_param: string }
        Returns: string
      }
      get_business_plan_progress: {
        Args: { plan_id: string }
        Returns: {
          overall_percentage: number
          sections: Json
        }[]
      }
      get_voting_sessions_with_counts: {
        Args: { business_plan_id_param: string }
        Returns: {
          id: string
          item_id: string
          item_type: string
          title: string
          content: string
          status: string
          deadline: string
          total_votes: number
          approve_votes: number
          reject_votes: number
          user_vote: string
          user_comment: string
          created_at: string
        }[]
      }
      user_can_lock_canvas_item: {
        Args: { item_id: string }
        Returns: boolean
      }
      user_has_access_to_business_plan: {
        Args: { plan_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
