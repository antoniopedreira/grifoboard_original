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
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-orange-500" />
          Materiais Necessários
          <Badge variant="secondary" className="ml-2">
            {materials.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum material adicionado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={material.id}>
                <div className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground mb-1">
                      {material.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Responsável: <span className="font-medium">{material.responsavel}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMaterial(material.id)}
                    className="ml-2 h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {index < materials.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        )}

        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg bg-card">
            <div>
              <Label htmlFor="material-descricao" className="text-xs">
                Descrição do Material
              </Label>
              <Input
                id="material-descricao"
                value={newMaterial.descricao}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Cimento Portland CP-IV 32"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="material-responsavel" className="text-xs">
                Responsável pelo Material
              </Label>
              <Input
                id="material-responsavel"
                value={newMaterial.responsavel}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Ex: João Silva"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMaterial} className="h-7 text-xs">
                Adicionar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewMaterial({ descricao: '', responsavel: '' });
                }}
                className="h-7 text-xs"
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
            className="w-full h-8 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar Material
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsSection;