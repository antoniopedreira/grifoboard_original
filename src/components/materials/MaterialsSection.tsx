import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Package } from 'lucide-react';
import { Material, CreateMaterialData } from '@/types/material';
import { materialService } from '@/services/materialService';
import { useToast } from '@/hooks/use-toast';

interface MaterialsSectionProps {
  tarefaId: string;
}

const MaterialsSection: React.FC<MaterialsSectionProps> = ({ tarefaId }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ descricao: '', responsavel: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await materialService.listarMateriaisPorTarefa(tarefaId);
      setMaterials(data);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.descricao.trim() || !newMaterial.responsavel.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const materialData: CreateMaterialData = {
        tarefa_id: tarefaId,
        descricao: newMaterial.descricao.trim(),
        responsavel: newMaterial.responsavel.trim(),
      };

      await materialService.criarMaterial(materialData);
      setNewMaterial({ descricao: '', responsavel: '' });
      setIsAdding(false);
      await loadMaterials();
      
      toast({
        title: "Sucesso",
        description: "Material adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o material",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMaterial = async (materialId: string) => {
    try {
      await materialService.excluirMaterial(materialId);
      await loadMaterials();
      
      toast({
        title: "Sucesso",
        description: "Material removido com sucesso",
      });
    } catch (error) {
      console.error('Error removing material:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o material",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [tarefaId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 rounded-lg border border-gray-100">
      <div className="p-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-gray-700">Materiais Necessários</span>
          <Badge variant="secondary" className="ml-1 h-5 text-[10px] px-1.5">
            {materials.length}
          </Badge>
        </div>
        <div className="space-y-2">
        {materials.length === 0 ? (
          <p className="text-[11px] text-gray-500 italic">
            Nenhum material adicionado ainda.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-thin">
            {materials.map((material, index) => (
              <div key={material.id} className="flex items-start justify-between p-2 bg-white/80 rounded border border-gray-100/80">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-[11px] text-gray-800 mb-0.5 line-clamp-1">
                    {material.descricao}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    <span className="font-medium">{material.responsavel}</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveMaterial(material.id)}
                  className="h-5 w-5 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAdding ? (
          <div className="space-y-2 p-2 border rounded bg-white/90">
            <div>
              <Label htmlFor="material-descricao" className="text-[10px] text-gray-600">
                Descrição do Material
              </Label>
              <Input
                id="material-descricao"
                value={newMaterial.descricao}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Cimento Portland CP-IV 32"
                className="mt-1 h-6 text-[11px] border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="material-responsavel" className="text-[10px] text-gray-600">
                Responsável pelo Material
              </Label>
              <Input
                id="material-responsavel"
                value={newMaterial.responsavel}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Ex: João Silva"
                className="mt-1 h-6 text-[11px] border-gray-200"
              />
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" onClick={handleAddMaterial} className="h-6 text-[10px] px-2">
                Adicionar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewMaterial({ descricao: '', responsavel: '' });
                }}
                className="h-6 text-[10px] px-2"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
            className="w-full h-6 text-[10px] border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Material
          </Button>
        )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsSection;