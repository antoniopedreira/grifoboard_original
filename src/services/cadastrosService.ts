import { supabase } from "@/integrations/supabase/client";

// --- Interfaces Baseadas nos Dados Reais ---

export interface ProfissionalPayload {
  nome_completo: string;
  cpf: string;
  data_nascimento?: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  funcao_principal: string;
  tempo_experiencia: string;
  disponibilidade_atual?: string;
  pretensao_valor?: string;
  equipamentos_proprios?: string; // "Sim" ou "Não"
  obras_relevantes?: string;
  modalidade_trabalho?: string; // "CLT", "PJ"
  // Arrays convertidos para JSON String
  regioes_atendidas?: string; 
  diferenciais?: string;
  especialidades?: string;
}

export interface FornecedorPayload {
  nome_empresa: string;
  cnpj_cpf: string;
  nome_responsavel: string;
  telefone: string;
  email: string;
  site?: string;
  cidade: string;
  estado: string;
  tempo_atuacao?: string;
  ticket_medio?: string;
  capacidade_atendimento?: string;
  // Arrays convertidos para JSON String
  categorias_atendidas?: string;
  regioes_atendidas?: string;
  diferenciais?: string;
  tipos_atuacao?: string;
}

export const cadastrosService = {
  // PROFISSIONAIS
  async createProfissional(data: ProfissionalPayload) {
    const { error } = await supabase.from('formulario_profissionais').insert(data);
    if (error) throw error;
  },

  // FORNECEDORES
  async createFornecedor(data: FornecedorPayload) {
    const { error } = await supabase.from('formulario_fornecedores').insert(data);
    if (error) throw error;
  },

  // EMPRESAS (Assumindo estrutura similar a fornecedores/profissionais)
  async createEmpresa(data: any) {
    // Mapeando para tabela de empresas (usaremos um payload genérico aqui se não tiver o JSON dela, 
    // mas seguindo o padrão de nome_empresa)
    const { error } = await supabase.from('formulario_empresas').insert(data);
    if (error) throw error;
  }
};
