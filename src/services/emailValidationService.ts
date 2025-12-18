import { supabase } from "@/integrations/supabase/client";

export type EmailValidationResult = {
  exists: boolean;
  source: string | null;
};

/**
 * Verifica se um email já existe em qualquer tabela do sistema
 * Tabelas verificadas: usuarios, formulario_profissionais, formulario_empresas, formulario_fornecedores
 */
export const checkEmailExistsGlobal = async (email: string): Promise<EmailValidationResult> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Verificar em usuarios
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  
  if (usuario) {
    return { exists: true, source: "usuário cadastrado" };
  }
  
  // Verificar em formulario_profissionais
  const { data: profissional } = await supabase
    .from("formulario_profissionais")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  
  if (profissional) {
    return { exists: true, source: "profissional" };
  }
  
  // Verificar em formulario_empresas (coluna email_contato)
  const { data: empresa } = await supabase
    .from("formulario_empresas")
    .select("id")
    .eq("email_contato", normalizedEmail)
    .maybeSingle();
  
  if (empresa) {
    return { exists: true, source: "empresa" };
  }
  
  // Verificar em formulario_fornecedores
  const { data: fornecedor } = await supabase
    .from("formulario_fornecedores")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  
  if (fornecedor) {
    return { exists: true, source: "fornecedor" };
  }
  
  return { exists: false, source: null };
};
