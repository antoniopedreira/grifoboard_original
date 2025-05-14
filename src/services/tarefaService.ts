
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { Tarefa } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

export const tarefasService = {
  async listarTarefas(obra_id: string): Promise<Tarefa[]> {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .eq('obra_id', obra_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async criarTarefa(tarefa: Omit<Task, 'id' | 'dailyStatus' | 'isFullyCompleted'>, obra_id: string): Promise<Tarefa> {
    const allDays: Task["dailyStatus"] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(day => ({
      day: day as any,
      status: tarefa.plannedDays.includes(day as any) ? "planned" : "not_planned"
    }));

    const novaTarefa = {
      ...tarefa,
      id: uuidv4(),
      obra_id,
      dailyStatus: allDays,
      isFullyCompleted: false,
      completionStatus: tarefa.completionStatus || "not_completed",
      weekStartDate: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tarefas')
      .insert([novaTarefa])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async atualizarTarefa(id: string, tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const { data, error } = await supabase
      .from('tarefas')
      .update(tarefa)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async excluirTarefa(id: string): Promise<void> {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
