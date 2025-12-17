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
  especialidades: string[]; // Array de texto (enviado como array, Supabase converte)
  especialidades_outro?: string | null;
  tempo_experiencia: string;
  obras_relevantes?: string | null;
  disponibilidade_atual: string;
  modalidade_trabalho: string;
  regioes_atendidas: string[];
  cidades_frequentes?: string | null;
  pretensao_valor: string;
  equipamentos_proprios: string;
  diferenciais: string[];
  diferenciais_outro?: string | null;
  telefone: string;
  email?: string | null;

  // --- ARQUIVOS (URLs ou JSON Strings) ---
  logo_path?: string | null; // Foto de Perfil
  fotos_trabalhos_path?: string | null; // JSON String com array de URLs
  curriculo_path?: string | null; // JSON String ou URL única
  certificacoes_path?: string | null; // JSON String com array de URLs
}

// --- FORNECEDORES (formulario_fornecedores) ---
export interface FornecedorPayload {
  nome_empresa: string;
  cnpj_cpf: string;
  site?: string | null;
  cidade: string;
  estado: string;
  tempo_atuacao: string;
  tipos_atuacao: string[];
  tipo_atuacao_outro?: string | null;
  categorias_atendidas: string[];
  categorias_outro?: string | null;
  ticket_medio: string;
  capacidade_atendimento: string;
  regioes_atendidas: string[];
  cidades_frequentes?: string | null;
  diferenciais: string[];
  diferenciais_outro?: string | null;
  nome_responsavel: string;
  telefone: string;
  email: string;

  // --- ARQUIVOS ---
  logo_path?: string | null;
  portfolio_path?: string | null;
  certificacoes_path?: string | null;
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
  tipos_obras: string[];
  tipos_obras_outro?: string | null;
  ticket_medio: string;
  planejamento_curto_prazo: string;
  ferramentas_gestao?: string | null;
  principais_desafios: string[];
  desafios_outro?: string | null;

  // --- ARQUIVOS ---
  logo_path?: string | null;
  apresentacao_path?: string | null;
}

export const cadastrosService = {
  // Envia para formulario_profissionais
  async createProfissional(data: ProfissionalPayload) {
    const { error } = await supabase.from("formulario_profissionais").insert(data);
    if (error) throw error;
  },

  // Envia para formulario_fornecedores
  async createFornecedor(data: FornecedorPayload) {
    const { error } = await supabase.from("formulario_fornecedores").insert(data);
    if (error) throw error;
  },

  // Envia para formulario_empresas
  async createEmpresa(data: EmpresaPayload) {
    const { error } = await supabase.from("formulario_empresas").insert(data);
    if (error) throw error;
  },
};
