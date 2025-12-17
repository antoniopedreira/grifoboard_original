import { supabase } from "@/integrations/supabase/client";

// --- PROFISSIONAIS (formulario_profissionais) ---
export interface ProfissionalPayload {
  nome_completo: string;
  cpf: string;
  data_nascimento: string; // Formato YYYY-MM-DD
  cidade: string;
  estado: string;
  funcao_principal: string;
  funcao_principal_outro?: string | null;
  especialidades: string[]; // Array de texto
  especialidades_outro?: string | null;
  tempo_experiencia: string;
  obras_relevantes?: string | null;
  disponibilidade_atual: string;
  modalidade_trabalho: string;
  regioes_atendidas: string[]; // Array de texto
  cidades_frequentes?: string | null;
  pretensao_valor: string;
  equipamentos_proprios: string;
  diferenciais: string[]; // Array de texto
  diferenciais_outro?: string | null;
  curriculo_path?: string | null;
  fotos_trabalhos_path?: string | null;
  certificacoes_path?: string | null;
  telefone: string;
  email?: string | null;
}

// --- FORNECEDORES (formulario_fornecedores) ---
export interface FornecedorPayload {
  nome_empresa: string;
  cnpj_cpf: string;
  site?: string | null;
  cidade: string;
  estado: string;
  tempo_atuacao: string;
  tipos_atuacao: string[]; // Array de texto
  tipo_atuacao_outro?: string | null;
  categorias_atendidas: string[]; // Array de texto
  categorias_outro?: string | null;
  ticket_medio: string;
  capacidade_atendimento: string;
  regioes_atendidas: string[]; // Array de texto
  cidades_frequentes?: string | null;
  diferenciais: string[]; // Array de texto
  diferenciais_outro?: string | null;
  logo_path?: string | null;
  portfolio_path?: string | null;
  certificacoes_path?: string | null;
  nome_responsavel: string;
  telefone: string;
  email: string;
}

// --- EMPRESAS (formulario_empresas) ---
export interface EmpresaPayload {
  nome_empresa: string;
  cnpj: string;
  site?: string | null;
  cidade: string;
  estado: string;
  ano_fundacao: string;
  tamanho_empresa: string;
  nome_contato: string;
  cargo_contato: string;
  whatsapp_contato: string;
  email_contato: string;
  obras_andamento: string;
  tipos_obras: string[]; // Array de texto
  tipos_obras_outro?: string | null;
  ticket_medio: string;
  planejamento_curto_prazo: string;
  ferramentas_gestao?: string | null;
  principais_desafios: string[]; // Array de texto
  desafios_outro?: string | null;
  logo_path?: string | null;
  apresentacao_path?: string | null;
}

export const cadastrosService = {
  // Envia para formulario_profissionais
  async createProfissional(data: ProfissionalPayload) {
    // O Supabase lida automaticamente com string[] para colunas text[]
    const { error } = await supabase.from('formulario_profissionais').insert(data);
    if (error) throw error;
  },

  // Envia para formulario_fornecedores
  async createFornecedor(data: FornecedorPayload) {
    const { error } = await supabase.from('formulario_fornecedores').insert(data);
    if (error) throw error;
  },

  // Envia para formulario_empresas
  async createEmpresa(data: EmpresaPayload) {
    const { error } = await supabase.from('formulario_empresas').insert(data);
    if (error) throw error;
  }
};
