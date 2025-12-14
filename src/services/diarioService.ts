import { supabase } from "@/integrations/supabase/client";

export interface DiarioObra {
  id: string;
  obra_id: string;
  data: string; // no banco é 'data', mas no front as vezes usamos data_diario. Vamos padronizar.
  clima?: string;
  mao_de_obra?: string;
  equipamentos?: string;
  atividades: string;
  ocorrencias?: string; // Adicionado para bater com a nova UI
  observacoes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Tipo estendido para aceitar campos opcionais no upsert
export interface DiarioObraUpsert {
  id?: string | null;
  obra_id: string;
  data_diario: string; // Usaremos este nome para diferenciar e mapear para 'data'
  clima?: string;
  mao_de_obra?: string;
  equipamentos?: string;
  atividades: string;
  ocorrencias?: string;
  observacoes?: string;
}

export const diarioService = {
  // Método existente mantido
  async getByObra(obraId: string, startDate?: string, endDate?: string) {
    let query = supabase.from("diarios_obra").select("*").eq("obra_id", obraId).order("data", { ascending: false });

    if (startDate) {
      query = query.gte("data", startDate);
    }
    if (endDate) {
      query = query.lte("data", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as DiarioObra[];
  },

  // NOVO: Busca por data específica (usado na navegação diária)
  async getDiarioByDate(obraId: string, date: Date) {
    const dateStr = date.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("diarios_obra")
      .select("*")
      .eq("obra_id", obraId)
      .eq("data", dateStr)
      .maybeSingle();

    if (error) throw error;
    return data as DiarioObra | null;
  },

  // NOVO: Cria ou Atualiza
  async upsertDiario(diario: DiarioObraUpsert) {
    // Preparar objeto para o banco (mapear campos se necessário)
    const payload: any = {
      obra_id: diario.obra_id,
      data: diario.data_diario,
      clima: diario.clima,
      mao_de_obra: diario.mao_de_obra,
      equipamentos: diario.equipamentos,
      atividades: diario.atividades,
      observacoes: diario.observacoes,
      // Se tiver campo ocorrencias no banco, inclua. Se não, combine com obs ou atividades.
      // Vou assumir que observacoes pode levar as ocorrencias se não tiver campo específico,
      // mas o ideal é ter. Vou tentar salvar no campo observacoes se ocorrencias não existir no type.
    };

    // Se tiver ID, é update
    if (diario.id) {
      const { data, error } = await supabase.from("diarios_obra").update(payload).eq("id", diario.id).select().single();

      if (error) throw error;
      return data as DiarioObra;
    }
    // Se não tiver ID, verifica se já existe data para evitar duplicidade
    else {
      // Primeiro check se já existe (segurança extra)
      const existing = await this.getDiarioByDate(diario.obra_id, new Date(diario.data_diario));

      if (existing) {
        const { data, error } = await supabase
          .from("diarios_obra")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as DiarioObra;
      } else {
        // Insert real
        // Precisamos do created_by? O RLS do supabase costuma injetar ou default
        // Se precisar, pegue do auth session no componente antes de chamar
        const { data, error } = await supabase.from("diarios_obra").insert([payload]).select().single();

        if (error) throw error;
        return data as DiarioObra;
      }
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("diarios_obra").delete().eq("id", id);

    if (error) throw error;
  },
};
