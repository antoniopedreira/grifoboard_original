
import { supabase } from '@/integrations/supabase/client';

interface Registro {
  id: string;
  obra_id: string;
  tipo: string;
  valor: string;
  created_at: string;
}

export const registrosService = {
  async listarRegistros(obra_id: string): Promise<Registro[]> {
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('obra_id', obra_id);
    
    if (error) {
      throw error;
    }
    return data || [];
  },

  async criarRegistro(registro: { obra_id: string; tipo: string; valor: string }): Promise<Registro> {
    const { data, error } = await supabase
      .from('registros')
      .insert([registro])
      .select()
      .single();
    
    if (error) {
      // If it's a unique violation error (duplicate), we can ignore it
      if (error.code === '23505') {
        // Try to fetch the existing record
        const { data: existingData } = await supabase
          .from('registros')
          .select('*')
          .eq('obra_id', registro.obra_id)
          .eq('tipo', registro.tipo)
          .eq('valor', registro.valor)
          .single();
          
        if (existingData) return existingData;
      }
      
      throw error;
    }
    return data;
  },

  async editarRegistro(id: string, novoValor: string): Promise<Registro> {
    // First, get the current registro to know the old value and type
    const { data: currentRegistro, error: fetchError } = await supabase
      .from('registros')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    const oldValue = currentRegistro.valor;
    const tipo = currentRegistro.tipo;
    const obraId = currentRegistro.obra_id;
    
    // Update the registro
    const { data, error } = await supabase
      .from('registros')
      .update({ valor: novoValor })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update related tables based on the type
    if (tipo === 'sector') {
      await supabase
        .from('tarefas')
        .update({ setor: novoValor })
        .eq('obra_id', obraId)
        .eq('setor', oldValue);
        
      await supabase
        .from('atividades_checklist')
        .update({ setor: novoValor })
        .eq('obra_id', obraId)
        .eq('setor', oldValue);
    } else if (tipo === 'discipline') {
      await supabase
        .from('tarefas')
        .update({ disciplina: novoValor })
        .eq('obra_id', obraId)
        .eq('disciplina', oldValue);
    } else if (tipo === 'team') {
      await supabase
        .from('tarefas')
        .update({ encarregado: novoValor })
        .eq('obra_id', obraId)
        .eq('encarregado', oldValue);
    } else if (tipo === 'responsible') {
      await supabase
        .from('tarefas')
        .update({ responsavel: novoValor })
        .eq('obra_id', obraId)
        .eq('responsavel', oldValue);
        
      await supabase
        .from('atividades_checklist')
        .update({ responsavel: novoValor })
        .eq('obra_id', obraId)
        .eq('responsavel', oldValue);
        
      // First get the task IDs for this obra
      const { data: tarefasIds } = await supabase
        .from('tarefas')
        .select('id')
        .eq('obra_id', obraId);
      
      if (tarefasIds && tarefasIds.length > 0) {
        const taskIds = tarefasIds.map(t => t.id);
        await supabase
          .from('materiais_tarefa')
          .update({ responsavel: novoValor })
          .eq('responsavel', oldValue)
          .in('tarefa_id', taskIds);
      }
    } else if (tipo === 'executor') {
      await supabase
        .from('tarefas')
        .update({ executante: novoValor })
        .eq('obra_id', obraId)
        .eq('executante', oldValue);
    }
    
    return data;
  },

  async excluirRegistro(obra_id: string, tipo: string, valor: string): Promise<void> {
    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('obra_id', obra_id)
      .eq('tipo', tipo)
      .eq('valor', valor);
    
    if (error) {
      throw error;
    }
  }
};
