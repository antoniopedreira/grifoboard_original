
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

    // Create the new task object with correct field names for Supabase
    const novaTarefa = {
      ...tarefa,
      id: uuidv4(),
      obra_id,
      dailystatus: allDays, // lowercase 's' to match database column name
      isfullycompleted: false, // lowercase to match database column name
      completionstatus: tarefa.completionStatus || "not_completed", // lowercase 's' to match database column name
      weekstartdate: new Date().toISOString() // lowercase to match database column name
    };

    console.log("Creating new task with data:", novaTarefa);

    const { data, error } = await supabase
      .from('tarefas')
      .insert([novaTarefa])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }
    return data;
  },

  async atualizarTarefa(id: string, tarefa: Partial<Task>): Promise<void> {
    // Convert camelCase fields to lowercase for database compatibility
    const dbTarefa: any = {};
    
    if (tarefa.dailyStatus) dbTarefa.dailystatus = tarefa.dailyStatus;
    if (tarefa.isFullyCompleted !== undefined) dbTarefa.isfullycompleted = tarefa.isFullyCompleted;
    if (tarefa.completionStatus) dbTarefa.completionstatus = tarefa.completionStatus;
    if (tarefa.weekStartDate) dbTarefa.weekstartdate = tarefa.weekStartDate;
    
    // Copy remaining fields as is
    Object.keys(tarefa).forEach(key => {
      if (!['dailyStatus', 'isFullyCompleted', 'completionStatus', 'weekStartDate'].includes(key)) {
        dbTarefa[key] = tarefa[key as keyof typeof tarefa];
      }
    });

    const { error } = await supabase
      .from('tarefas')
      .update(dbTarefa)
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
