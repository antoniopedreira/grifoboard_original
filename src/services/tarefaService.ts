
import { supabase } from '@/integrations/supabase/client';
import { Tarefa } from '@/types/supabase';

export const tarefasService = {
  async listarTarefas(obra_id: string): Promise<Tarefa[]> {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('obra_id', obra_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  },

  async criarTarefa(tarefa: Omit<Tarefa, 'id' | 'created_at'>): Promise<Tarefa> {
    // Validate required fields
    if (!tarefa.obra_id) {
      throw new Error("obra_id é obrigatório");
    }
    if (!tarefa.semana) {
      throw new Error("semana é obrigatória");
    }

    const { data, error } = await supabase
      .from('tarefas')
      .insert([tarefa])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  async atualizarTarefa(id: string, tarefa: Partial<Tarefa>): Promise<void> {
    const { error } = await supabase
      .from('tarefas')
      .update(tarefa)
      .eq('id', id);
    
    if (error) throw error;
  },

  async excluirTarefa(id: string): Promise<void> {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
