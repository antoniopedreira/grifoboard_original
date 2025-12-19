import { supabase } from "@/integrations/supabase/client";

// Tipos alinhados com o Banco de Dados
export interface PlaybookConfig {
  obra_id: string;
  coeficiente_1: number;
  coeficiente_2: number;
  coeficiente_selecionado: "1" | "2";
}

export interface PlaybookItemInsert {
  obra_id: string;
  descricao: string;
  unidade: string;
  qtd: number;
  preco_unitario: number;
  preco_total: number;
  is_etapa: boolean;
  nivel: number; // 0=Principal, 1=Subetapa, 2=Item
  ordem: number;
}

// Interface para atualização individual (Fase 2 - Gestão)
export interface PlaybookItemUpdate {
  destino?: string | null;
  responsavel?: string | null;
  data_limite?: string | null;
  valor_contratado?: number | null;
  status_contratacao?: string;
  observacao?: string | null;
}

export const playbookService = {
  // 1. Salvar Playbook Completo (Importação)
  async savePlaybook(obraId: string, config: PlaybookConfig, items: PlaybookItemInsert[]) {
    // A. Salvar/Atualizar Configuração (Upsert)
    const { error: configError } = await supabase.from("playbook_config").upsert(
      {
        obra_id: obraId,
        coeficiente_1: config.coeficiente_1,
        coeficiente_2: config.coeficiente_2,
        coeficiente_selecionado: config.coeficiente_selecionado,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "obra_id" },
    );

    if (configError) throw configError;

    // B. Limpar itens antigos dessa obra (para substituir pela nova importação)
    const { error: deleteError } = await supabase.from("playbook_items").delete().eq("obra_id", obraId);

    if (deleteError) throw deleteError;

    // C. Inserir novos itens
    if (items.length > 0) {
      const { error: insertError } = await supabase.from("playbook_items").insert(items as any); // "as any" para evitar conflito com tipos gerados antigos

      if (insertError) throw insertError;
    }

    return true;
  },

  // 2. Buscar Dados
  async getPlaybook(obraId: string) {
    // Buscar Config usando maybeSingle para evitar erro 406
    const { data: config, error: configError } = await supabase
      .from("playbook_config")
      .select("*")
      .eq("obra_id", obraId)
      .maybeSingle();

    if (configError) {
      console.error("Erro ao buscar config:", configError);
    }

    // Buscar Itens ordenados
    const { data: items, error: itemsError } = await supabase
      .from("playbook_items")
      .select("*")
      .eq("obra_id", obraId)
      .order("ordem", { ascending: true });

    if (itemsError) throw itemsError;

    return { config: config || null, items: items || [] };
  },

  // 3. Atualizar Item Individual (Fase 2 - Gestão de Contratação)
  // Alterado itemId para 'string' (UUID)
  async updateItem(itemId: string, updates: PlaybookItemUpdate) {
    const { error } = await supabase
      .from("playbook_items")
      // "as any" aqui resolve o erro TS2559 (propriedades novas não reconhecidas)
      .update(updates as any)
      .eq("id", itemId);

    if (error) throw error;
    return true;
  },
};
