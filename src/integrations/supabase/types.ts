export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      atividades_checklist: {
        Row: {
          concluida: boolean
          created_at: string
          data_inicio: string | null
          data_termino: string | null
          descricao: string | null
          id: string
          local: string
          obra_id: string
          responsavel: string
          setor: string
          updated_at: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_inicio?: string | null
          data_termino?: string | null
          descricao?: string | null
          id?: string
          local: string
          obra_id: string
          responsavel: string
          setor: string
          updated_at?: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_inicio?: string | null
          data_termino?: string | null
          descricao?: string | null
          id?: string
          local?: string
          obra_id?: string
          responsavel?: string
          setor?: string
          updated_at?: string
        }
        Relationships: []
      }
      materiais_tarefa: {
        Row: {
          created_at: string
          descricao: string
          id: string
          responsavel: string
          tarefa_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          responsavel: string
          tarefa_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          responsavel?: string
          tarefa_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      obras: {
        Row: {
          created_at: string | null
          data_inicio: string | null
          id: string
          localizacao: string | null
          nome_obra: string
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_inicio?: string | null
          id?: string
          localizacao?: string | null
          nome_obra: string
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_inicio?: string | null
          id?: string
          localizacao?: string | null
          nome_obra?: string
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      registros: {
        Row: {
          created_at: string
          id: string
          obra_id: string
          tipo: string
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          obra_id: string
          tipo: string
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          obra_id?: string
          tipo?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          causa_nao_execucao: string | null
          created_at: string | null
          descricao: string
          disciplina: string
          dom: string | null
          encarregado: string
          executante: string
          id: string
          item: string
          obra_id: string | null
          percentual_executado: number | null
          qua: string | null
          qui: string | null
          responsavel: string
          sab: string | null
          seg: string | null
          semana: string
          setor: string
          sex: string | null
          ter: string | null
          updated_at: string | null
        }
        Insert: {
          causa_nao_execucao?: string | null
          created_at?: string | null
          descricao: string
          disciplina: string
          dom?: string | null
          encarregado: string
          executante: string
          id?: string
          item: string
          obra_id?: string | null
          percentual_executado?: number | null
          qua?: string | null
          qui?: string | null
          responsavel: string
          sab?: string | null
          seg?: string | null
          semana: string
          setor: string
          sex?: string | null
          ter?: string | null
          updated_at?: string | null
        }
        Update: {
          causa_nao_execucao?: string | null
          created_at?: string | null
          descricao?: string
          disciplina?: string
          dom?: string | null
          encarregado?: string
          executante?: string
          id?: string
          item?: string
          obra_id?: string | null
          percentual_executado?: number | null
          qua?: string | null
          qui?: string | null
          responsavel?: string
          sab?: string | null
          seg?: string | null
          semana?: string
          setor?: string
          sex?: string | null
          ter?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          email: string | null
          id: string
          nome: string | null
        }
        Insert: {
          email?: string | null
          id: string
          nome?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      whatsapp_accounts: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          label: string | null
          phone_e164: string
          wa_id: string
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          label?: string | null
          phone_e164: string
          wa_id?: string
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          label?: string | null
          phone_e164?: string
          wa_id?: string
        }
        Relationships: []
      }
      whatsapp_obras: {
        Row: {
          created_at: string | null
          obra_id: string
          role: string | null
          wa_id: string
        }
        Insert: {
          created_at?: string | null
          obra_id: string
          role?: string | null
          wa_id: string
        }
        Update: {
          created_at?: string | null
          obra_id?: string
          role?: string | null
          wa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_obras_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_obras_wa_id_fkey"
            columns: ["wa_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["wa_id"]
          },
        ]
      }
    }
    Views: {
      resumo_execucao_semanal: {
        Row: {
          obra_id: string | null
          percentual_concluido: number | null
          semana: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
