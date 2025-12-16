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
      diario_fotos: {
        Row: {
          criado_em: string
          criado_por: string
          data: string
          id: string
          legenda: string | null
          obra_id: string
          path: string
        }
        Insert: {
          criado_em?: string
          criado_por: string
          data: string
          id?: string
          legenda?: string | null
          obra_id: string
          path: string
        }
        Update: {
          criado_em?: string
          criado_por?: string
          data?: string
          id?: string
          legenda?: string | null
          obra_id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "diario_fotos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      diarios_obra: {
        Row: {
          atividades: string
          clima: string | null
          created_at: string
          created_by: string
          data: string
          equipamentos: string | null
          id: string
          mao_de_obra: string | null
          obra_id: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          atividades: string
          clima?: string | null
          created_at?: string
          created_by: string
          data: string
          equipamentos?: string | null
          id?: string
          mao_de_obra?: string | null
          obra_id: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          atividades?: string
          clima?: string | null
          created_at?: string
          created_by?: string
          data?: string
          equipamentos?: string | null
          id?: string
          mao_de_obra?: string | null
          obra_id?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diarios_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      formulario_empresas: {
        Row: {
          ano_fundacao: string
          apresentacao_path: string | null
          cargo_contato: string
          cidade: string
          cnpj: string
          created_at: string | null
          desafios_outro: string | null
          email_contato: string
          estado: string
          ferramentas_gestao: string | null
          id: string
          logo_path: string | null
          nome_contato: string
          nome_empresa: string
          obras_andamento: string
          planejamento_curto_prazo: string
          principais_desafios: string[]
          site: string | null
          tamanho_empresa: string
          ticket_medio: string
          tipos_obras: string[]
          tipos_obras_outro: string | null
          whatsapp_contato: string
        }
        Insert: {
          ano_fundacao: string
          apresentacao_path?: string | null
          cargo_contato: string
          cidade: string
          cnpj: string
          created_at?: string | null
          desafios_outro?: string | null
          email_contato: string
          estado: string
          ferramentas_gestao?: string | null
          id?: string
          logo_path?: string | null
          nome_contato: string
          nome_empresa: string
          obras_andamento: string
          planejamento_curto_prazo: string
          principais_desafios: string[]
          site?: string | null
          tamanho_empresa: string
          ticket_medio: string
          tipos_obras: string[]
          tipos_obras_outro?: string | null
          whatsapp_contato: string
        }
        Update: {
          ano_fundacao?: string
          apresentacao_path?: string | null
          cargo_contato?: string
          cidade?: string
          cnpj?: string
          created_at?: string | null
          desafios_outro?: string | null
          email_contato?: string
          estado?: string
          ferramentas_gestao?: string | null
          id?: string
          logo_path?: string | null
          nome_contato?: string
          nome_empresa?: string
          obras_andamento?: string
          planejamento_curto_prazo?: string
          principais_desafios?: string[]
          site?: string | null
          tamanho_empresa?: string
          ticket_medio?: string
          tipos_obras?: string[]
          tipos_obras_outro?: string | null
          whatsapp_contato?: string
        }
        Relationships: []
      }
      formulario_fornecedores: {
        Row: {
          capacidade_atendimento: string
          categorias_atendidas: string[]
          categorias_outro: string | null
          certificacoes_path: string | null
          cidade: string
          cidades_frequentes: string | null
          cnpj_cpf: string
          created_at: string | null
          diferenciais: string[]
          diferenciais_outro: string | null
          email: string
          estado: string
          id: string
          logo_path: string | null
          nome_empresa: string
          nome_responsavel: string
          portfolio_path: string | null
          regioes_atendidas: string[]
          site: string | null
          telefone: string
          tempo_atuacao: string
          ticket_medio: string
          tipo_atuacao_outro: string | null
          tipos_atuacao: string[]
        }
        Insert: {
          capacidade_atendimento: string
          categorias_atendidas: string[]
          categorias_outro?: string | null
          certificacoes_path?: string | null
          cidade: string
          cidades_frequentes?: string | null
          cnpj_cpf: string
          created_at?: string | null
          diferenciais: string[]
          diferenciais_outro?: string | null
          email: string
          estado: string
          id?: string
          logo_path?: string | null
          nome_empresa: string
          nome_responsavel: string
          portfolio_path?: string | null
          regioes_atendidas: string[]
          site?: string | null
          telefone: string
          tempo_atuacao: string
          ticket_medio: string
          tipo_atuacao_outro?: string | null
          tipos_atuacao: string[]
        }
        Update: {
          capacidade_atendimento?: string
          categorias_atendidas?: string[]
          categorias_outro?: string | null
          certificacoes_path?: string | null
          cidade?: string
          cidades_frequentes?: string | null
          cnpj_cpf?: string
          created_at?: string | null
          diferenciais?: string[]
          diferenciais_outro?: string | null
          email?: string
          estado?: string
          id?: string
          logo_path?: string | null
          nome_empresa?: string
          nome_responsavel?: string
          portfolio_path?: string | null
          regioes_atendidas?: string[]
          site?: string | null
          telefone?: string
          tempo_atuacao?: string
          ticket_medio?: string
          tipo_atuacao_outro?: string | null
          tipos_atuacao?: string[]
        }
        Relationships: []
      }
      formulario_profissionais: {
        Row: {
          certificacoes_path: string | null
          cidade: string
          cidades_frequentes: string | null
          cpf: string
          created_at: string | null
          curriculo_path: string | null
          data_nascimento: string
          diferenciais: string[]
          diferenciais_outro: string | null
          disponibilidade_atual: string
          email: string | null
          equipamentos_proprios: string
          especialidades: string[]
          especialidades_outro: string | null
          estado: string
          fotos_trabalhos_path: string | null
          funcao_principal: string
          funcao_principal_outro: string | null
          id: string
          modalidade_trabalho: string
          nome_completo: string
          obras_relevantes: string | null
          pretensao_valor: string
          regioes_atendidas: string[]
          telefone: string
          tempo_experiencia: string
        }
        Insert: {
          certificacoes_path?: string | null
          cidade: string
          cidades_frequentes?: string | null
          cpf: string
          created_at?: string | null
          curriculo_path?: string | null
          data_nascimento: string
          diferenciais: string[]
          diferenciais_outro?: string | null
          disponibilidade_atual: string
          email?: string | null
          equipamentos_proprios: string
          especialidades: string[]
          especialidades_outro?: string | null
          estado: string
          fotos_trabalhos_path?: string | null
          funcao_principal: string
          funcao_principal_outro?: string | null
          id?: string
          modalidade_trabalho: string
          nome_completo: string
          obras_relevantes?: string | null
          pretensao_valor: string
          regioes_atendidas: string[]
          telefone: string
          tempo_experiencia: string
        }
        Update: {
          certificacoes_path?: string | null
          cidade?: string
          cidades_frequentes?: string | null
          cpf?: string
          created_at?: string | null
          curriculo_path?: string | null
          data_nascimento?: string
          diferenciais?: string[]
          diferenciais_outro?: string | null
          disponibilidade_atual?: string
          email?: string | null
          equipamentos_proprios?: string
          especialidades?: string[]
          especialidades_outro?: string | null
          estado?: string
          fotos_trabalhos_path?: string | null
          funcao_principal?: string
          funcao_principal_outro?: string | null
          id?: string
          modalidade_trabalho?: string
          nome_completo?: string
          obras_relevantes?: string | null
          pretensao_valor?: string
          regioes_atendidas?: string[]
          telefone?: string
          tempo_experiencia?: string
        }
        Relationships: []
      }
      marketplace_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          target_id: string
          target_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          target_id: string
          target_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          target_id?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string
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
          created_by: string | null
          data_inicio: string | null
          data_termino: string | null
          empresa_id: string | null
          id: string
          localizacao: string | null
          nome_obra: string
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          empresa_id?: string | null
          id?: string
          localizacao?: string | null
          nome_obra: string
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string | null
          data_termino?: string | null
          empresa_id?: string | null
          id?: string
          localizacao?: string | null
          nome_obra?: string
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_config: {
        Row: {
          coeficiente_1: number | null
          coeficiente_2: number | null
          coeficiente_selecionado: string | null
          created_at: string
          id: string
          obra_id: string
          updated_at: string
        }
        Insert: {
          coeficiente_1?: number | null
          coeficiente_2?: number | null
          coeficiente_selecionado?: string | null
          created_at?: string
          id?: string
          obra_id: string
          updated_at?: string
        }
        Update: {
          coeficiente_1?: number | null
          coeficiente_2?: number | null
          coeficiente_selecionado?: string | null
          created_at?: string
          id?: string
          obra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_config_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: true
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_fornecimentos: {
        Row: {
          created_at: string | null
          etapa: string
          id: string
          obra_id: string
          observacao: string | null
          orcamento_meta_unitario: number
          proposta: string
          quantidade: number
          responsavel: string
          status: string
          unidade: string
          updated_at: string | null
          valor_contratado: number | null
        }
        Insert: {
          created_at?: string | null
          etapa: string
          id?: string
          obra_id: string
          observacao?: string | null
          orcamento_meta_unitario: number
          proposta: string
          quantidade: number
          responsavel: string
          status: string
          unidade: string
          updated_at?: string | null
          valor_contratado?: number | null
        }
        Update: {
          created_at?: string | null
          etapa?: string
          id?: string
          obra_id?: string
          observacao?: string | null
          orcamento_meta_unitario?: number
          proposta?: string
          quantidade?: number
          responsavel?: string
          status?: string
          unidade?: string
          updated_at?: string | null
          valor_contratado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_fornecimentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_items: {
        Row: {
          created_at: string
          descricao: string
          id: string
          is_etapa: boolean | null
          obra_id: string
          ordem: number
          preco_total: number | null
          preco_unitario: number | null
          qtd: number | null
          unidade: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          is_etapa?: boolean | null
          obra_id: string
          ordem: number
          preco_total?: number | null
          preco_unitario?: number | null
          qtd?: number | null
          unidade?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          is_etapa?: boolean | null
          obra_id?: string
          ordem?: number
          preco_total?: number | null
          preco_unitario?: number | null
          qtd?: number | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_items_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_obra: {
        Row: {
          created_at: string | null
          etapa: string
          id: string
          obra_id: string
          observacao: string | null
          orcamento_meta_unitario: number
          proposta: string
          quantidade: number
          responsavel: string
          status: string
          unidade: string
          updated_at: string | null
          valor_contratado: number | null
        }
        Insert: {
          created_at?: string | null
          etapa: string
          id?: string
          obra_id: string
          observacao?: string | null
          orcamento_meta_unitario: number
          proposta: string
          quantidade: number
          responsavel: string
          status: string
          unidade: string
          updated_at?: string | null
          valor_contratado?: number | null
        }
        Update: {
          created_at?: string | null
          etapa?: string
          id?: string
          obra_id?: string
          observacao?: string | null
          orcamento_meta_unitario?: number
          proposta?: string
          quantidade?: number
          responsavel?: string
          status?: string
          unidade?: string
          updated_at?: string | null
          valor_contratado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      registros: {
        Row: {
          created_at: string
          empresa_id: string | null
          id: string
          obra_id: string | null
          tipo: string
          user_id: string | null
          valor: string
        }
        Insert: {
          created_at?: string
          empresa_id?: string | null
          id?: string
          obra_id?: string | null
          tipo: string
          user_id?: string | null
          valor: string
        }
        Update: {
          created_at?: string
          empresa_id?: string | null
          id?: string
          obra_id?: string | null
          tipo?: string
          user_id?: string | null
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
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
          ordem: number | null
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
          ordem?: number | null
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
          ordem?: number | null
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
          empresa_id: string | null
          id: string
          last_login: string | null
          nome: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          email?: string | null
          empresa_id?: string | null
          id: string
          last_login?: string | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          email?: string | null
          empresa_id?: string | null
          id?: string
          last_login?: string | null
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
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
      current_empresa_id: { Args: never; Returns: string }
      get_empresas_stats: {
        Args: never
        Returns: {
          created_at: string
          id: string
          nome: string
          total_obras: number
          total_usuarios: number
          ultimo_login: string
        }[]
      }
      is_company_admin: { Args: never; Returns: boolean }
      is_master_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "admin" | "member" | "master_admin"
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
    Enums: {
      user_role: ["admin", "member", "master_admin"],
    },
  },
} as const
