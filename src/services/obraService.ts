
import { supabase } from '@/integrations/supabase/client';
import { Obra } from '@/types/supabase';

export const obrasService = {
  async listarObras(): Promise<Obra[]> {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error listing obras:", error);
      throw error;
    }
    return data || [];
  },

  async criarObra(obra: Omit<Obra, 'id' | 'usuario_id' | 'created_at'>): Promise<Obra> {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Usuário não autenticado');
    
    // Add the user_id to the obra data
    const obraWithUserId = {
      ...obra,
      usuario_id: user.id
    };
    
    const { data, error } = await supabase
      .from('obras')
      .insert([obraWithUserId])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating obra:", error);
      throw error;
    }
    return data;
  },

  async atualizarObra(id: string, obra: Partial<Obra>): Promise<Obra> {
    const { data, error } = await supabase
      .from('obras')
      .update(obra)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating obra:", error);
      throw error;
    }
    return data;
  },

  async excluirObra(id: string): Promise<void> {
    const { error } = await supabase
      .from('obras')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting obra:", error);
      throw error;
    }
  }
};
