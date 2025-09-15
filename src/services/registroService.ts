
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
    const { data, error } = await supabase
      .from('registros')
      .update({ valor: novoValor })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
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
