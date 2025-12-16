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
  nivel: number; // --- NOVO CAMPO ADICIONADO ---
  ordem: number;
}

export const playbookService = {
  // Salvar tudo (Config + Itens)
  async savePlaybook(obraId: string, config: PlaybookConfig, items: PlaybookItemInsert[]) {
    // 1. Salvar/Atualizar Configuração (Upsert)
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

    // 2. Limpar itens antigos dessa obra (para substituir pela nova importação)
    const { error: deleteError } = await supabase.from("playbook_items").delete().eq("obra_id", obraId);

    if (deleteError) throw deleteError;

    // 3. Inserir novos itens
    if (items.length > 0) {
      const { error: insertError } = await supabase.from("playbook_items").insert(items); // O Supabase deve aceitar o campo 'nivel' se a migration foi rodada

      if (insertError) throw insertError;
    }

    return true;
  },

  // Buscar dados
  async getPlaybook(obraId: string) {
    // Buscar Config
    const { data: config, error: configError } = await supabase
      .from("playbook_config")
      .select("*")
      .eq("obra_id", obraId)
      .single();

    if (configError && configError.code !== "PGRST116") {
      // Ignora erro se não existir ainda
      console.error("Erro ao buscar config:", configError);
    }

    // Buscar Itens ordenados
    const { data: items, error: itemsError } = await supabase
      .from("playbook_items")
      .select("*")
      .eq("obra_id", obraId)
      .order("ordem", { ascending: true });

    if (itemsError) throw itemsError;

    return { config, items };
  },
};
