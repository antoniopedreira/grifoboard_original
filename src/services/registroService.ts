
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
      console.error("Error listing registros:", error);
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
        console.log("Registry already exists:", registro);
        
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
      
      console.error("Error creating registro:", error);
      throw error;
    }
    return data;
  },

  async excluirRegistro(obra_id: string, tipo: string, valor: string): Promise<void> {
    console.log(`Excluindo registro: obra_id=${obra_id}, tipo=${tipo}, valor=${valor}`);
    
    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('obra_id', obra_id)
      .eq('tipo', tipo)
      .eq('valor', valor);
    
    if (error) {
      console.error("Error deleting registro:", error);
      throw error;
    }
    
    console.log("Registro excluído com sucesso");
  }
};
