import { supabase } from '@/integrations/supabase/client';
import { Material, CreateMaterialData } from '@/types/material';

export const materialService = {
  async listarMateriaisPorTarefa(tarefaId: string): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materiais_tarefa')
      .select('*')
      .eq('tarefa_id', tarefaId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async criarMaterial(material: CreateMaterialData): Promise<Material> {
    const { data, error } = await supabase
      .from('materiais_tarefa')
      .insert([material])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async excluirMaterial(materialId: string): Promise<void> {
    const { error } = await supabase
      .from('materiais_tarefa')
      .delete()
      .eq('id', materialId);
    
    if (error) throw error;
  }
};