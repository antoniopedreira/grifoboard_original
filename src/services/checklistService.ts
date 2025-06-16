
import { supabase } from "@/integrations/supabase/client";
import { AtividadeChecklist, NovaAtividadeChecklist } from "@/types/checklist";

export const checklistService = {
  async listarAtividades(obraId: string): Promise<AtividadeChecklist[]> {
    const { data, error } = await supabase
      .from('atividades_checklist')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching checklist activities:', error);
      throw new Error(`Erro ao carregar atividades: ${error.message}`);
    }

    return data || [];
  },

  async criarAtividade(atividade: NovaAtividadeChecklist): Promise<AtividadeChecklist> {
    const { data, error } = await supabase
      .from('atividades_checklist')
      .insert(atividade)
      .select()
      .single();

    if (error) {
      console.error('Error creating checklist activity:', error);
      throw new Error(`Erro ao criar atividade: ${error.message}`);
    }

    return data;
  },

  async atualizarAtividade(id: string, updates: Partial<AtividadeChecklist>): Promise<AtividadeChecklist> {
    const { data, error } = await supabase
      .from('atividades_checklist')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating checklist activity:', error);
      throw new Error(`Erro ao atualizar atividade: ${error.message}`);
    }

    return data;
  },

  async excluirAtividade(id: string): Promise<void> {
    const { error } = await supabase
      .from('atividades_checklist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting checklist activity:', error);
      throw new Error(`Erro ao excluir atividade: ${error.message}`);
    }
  }
};
