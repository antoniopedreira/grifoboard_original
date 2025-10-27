import { supabase } from "@/integrations/supabase/client";

export interface DiarioObra {
  id: string;
  obra_id: string;
  data: string;
  clima?: string;
  mao_de_obra?: string;
  equipamentos?: string;
  atividades: string;
  observacoes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DiarioObraInsert {
  obra_id: string;
  data: string;
  clima?: string;
  mao_de_obra?: string;
  equipamentos?: string;
  atividades: string;
  observacoes?: string;
  created_by: string;
}

export const diarioService = {
  async getByObra(obraId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from("diarios_obra")
      .select("*")
      .eq("obra_id", obraId)
      .order("data", { ascending: false });

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

  async create(diario: DiarioObraInsert) {
    const { data, error } = await supabase
      .from("diarios_obra")
      .insert(diario)
      .select()
      .single();

    if (error) throw error;
    return data as DiarioObra;
  },

  async update(id: string, updates: Partial<DiarioObraInsert>) {
    const { data, error } = await supabase
      .from("diarios_obra")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as DiarioObra;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("diarios_obra")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
