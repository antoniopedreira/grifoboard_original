import { supabase } from '@/integrations/supabase/client';

interface Registro {
  id: string;
  obra_id: string;
  tipo: string;
  valor: string;
  created_at: string;
}

class RegistroServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'RegistroServiceError';
  }
}

const VALID_TIPOS = ['sector', 'discipline', 'team', 'responsible', 'executor'] as const;
type TipoRegistro = typeof VALID_TIPOS[number];

// Helper function to update related tables
async function updateRelatedTables(
  tipo: TipoRegistro, 
  obraId: string, 
  oldValue: string, 
  newValue: string
): Promise<void> {
  try {
    switch (tipo) {
      case 'sector':
        await Promise.all([
          supabase.from('tarefas')
            .update({ setor: newValue })
            .eq('obra_id', obraId)
            .eq('setor', oldValue),
          supabase.from('atividades_checklist')
            .update({ setor: newValue })
            .eq('obra_id', obraId)
            .eq('setor', oldValue)
        ]);
        break;

      case 'discipline':
        await supabase.from('tarefas')
          .update({ disciplina: newValue })
          .eq('obra_id', obraId)
          .eq('disciplina', oldValue);
        break;

      case 'team':
        await supabase.from('tarefas')
          .update({ encarregado: newValue })
          .eq('obra_id', obraId)
          .eq('encarregado', oldValue);
        break;

      case 'responsible':
        await Promise.all([
          supabase.from('tarefas')
            .update({ responsavel: newValue })
            .eq('obra_id', obraId)
            .eq('responsavel', oldValue),
          supabase.from('atividades_checklist')
            .update({ responsavel: newValue })
            .eq('obra_id', obraId)
            .eq('responsavel', oldValue)
        ]);

        // Update materials
        const { data: tarefasIds } = await supabase
          .from('tarefas')
          .select('id')
          .eq('obra_id', obraId);
        
        if (tarefasIds && tarefasIds.length > 0) {
          const taskIds = tarefasIds.map(t => t.id);
          await supabase.from('materiais_tarefa')
            .update({ responsavel: newValue })
            .eq('responsavel', oldValue)
            .in('tarefa_id', taskIds);
        }
        break;

      case 'executor':
        await supabase.from('tarefas')
          .update({ executante: newValue })
          .eq('obra_id', obraId)
          .eq('executante', oldValue);
        break;
    }
  } catch (error) {
    console.error('Erro ao atualizar tabelas relacionadas:', error);
    throw error;
  }
}

export const registrosService = {
  async listarRegistros(obra_id: string): Promise<Registro[]> {
    if (!obra_id) {
      throw new RegistroServiceError('ID da obra é obrigatório');
    }

    const { data, error } = await supabase
      .from('registros')
      .select('id, obra_id, tipo, valor, created_at')
      .eq('obra_id', obra_id)
      .order('tipo', { ascending: true })
      .order('valor', { ascending: true });
    
    if (error) {
      throw new RegistroServiceError('Erro ao listar registros', error);
    }
    
    return data ?? [];
  },

  async criarRegistro(registro: { obra_id: string; tipo: string; valor: string }): Promise<Registro> {
    if (!registro.obra_id) {
      throw new RegistroServiceError('ID da obra é obrigatório');
    }
    
    if (!registro.tipo || !registro.valor?.trim()) {
      throw new RegistroServiceError('Tipo e valor são obrigatórios');
    }

    const { data, error } = await supabase
      .from('registros')
      .insert([registro])
      .select()
      .single();
    
    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        const { data: existingData } = await supabase
          .from('registros')
          .select('*')
          .eq('obra_id', registro.obra_id)
          .eq('tipo', registro.tipo)
          .eq('valor', registro.valor)
          .single();
          
        if (existingData) return existingData;
      }
      
      throw new RegistroServiceError('Erro ao criar registro', error);
    }

    if (!data) {
      throw new RegistroServiceError('Nenhum dado retornado ao criar registro');
    }
    
    return data;
  },

  async editarRegistro(id: string, novoValor: string): Promise<Registro> {
    if (!id) {
      throw new RegistroServiceError('ID do registro é obrigatório');
    }

    if (!novoValor?.trim()) {
      throw new RegistroServiceError('Novo valor é obrigatório');
    }

    // Fetch current registro
    const { data: currentRegistro, error: fetchError } = await supabase
      .from('registros')
      .select('id, obra_id, tipo, valor, created_at')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw new RegistroServiceError('Erro ao buscar registro', fetchError);
    }

    if (!currentRegistro) {
      throw new RegistroServiceError('Registro não encontrado');
    }
    
    const oldValue = currentRegistro.valor;
    const tipo = currentRegistro.tipo as TipoRegistro;
    const obraId = currentRegistro.obra_id;
    
    // If value hasn't changed, return early
    if (oldValue === novoValor) {
      return currentRegistro;
    }

    // Update the registro
    const { data, error } = await supabase
      .from('registros')
      .update({ valor: novoValor })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new RegistroServiceError('Erro ao atualizar registro', error);
    }

    if (!data) {
      throw new RegistroServiceError('Nenhum dado retornado ao atualizar registro');
    }
    
    // Update related tables - await to ensure consistency
    try {
      await updateRelatedTables(tipo, obraId, oldValue, novoValor);
    } catch (relatedError) {
      console.error('Erro ao atualizar tabelas relacionadas:', relatedError);
      // Continue even if related updates fail - the main registro was updated
    }
    
    return data;
  },

  async excluirRegistro(obra_id: string, tipo: string, valor: string): Promise<void> {
    if (!obra_id || !tipo || !valor) {
      throw new RegistroServiceError('Obra ID, tipo e valor são obrigatórios');
    }

    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('obra_id', obra_id)
      .eq('tipo', tipo)
      .eq('valor', valor);
    
    if (error) {
      throw new RegistroServiceError('Erro ao excluir registro', error);
    }
  }
};
