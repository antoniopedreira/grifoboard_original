import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AtividadeChecklist } from "@/types/checklist";
import { checklistService } from "@/services/checklistService";
import ChecklistTable from "./ChecklistTable";
import ChecklistForm from "./ChecklistForm";
import ChecklistFilters from "./ChecklistFilters";
import ChecklistStats from "./ChecklistStats";
import { CheckSquare } from "lucide-react";

const ChecklistContent = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [atividades, setAtividades] = useState<AtividadeChecklist[]>([]);
  const [filteredAtividades, setFilteredAtividades] = useState<AtividadeChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    local: '',
    setor: '',
    responsavel: ''
  });

  // Calculate unique values for filters
  const uniqueValues = useMemo(() => {
    const uniqueLocais = [...new Set(atividades.map(atividade => atividade.local))].filter(Boolean).sort();
    const uniqueSetores = [...new Set(atividades.map(atividade => atividade.setor))].filter(Boolean).sort();
    const uniqueResponsaveis = [...new Set(atividades.map(atividade => atividade.responsavel))].filter(Boolean).sort();
    
    return {
      uniqueLocais,
      uniqueSetores,
      uniqueResponsaveis
    };
  }, [atividades]);

  const loadAtividades = async () => {
    if (!userSession?.obraAtiva) return;
    
    setIsLoading(true);
    try {
      const atividadesData = await checklistService.listarAtividades(userSession.obraAtiva.id);
      
      setAtividades(atividadesData);
      setFilteredAtividades(atividadesData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao carregar atividades",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (filters: { local: string; setor: string; responsavel: string }) => {
    setFilters(filters);
    
    let filtered = atividades;
    
    if (filters.local) {
      filtered = filtered.filter(atividade => atividade.local === filters.local);
    }
    
    if (filters.setor) {
      filtered = filtered.filter(atividade => atividade.setor === filters.setor);
    }
    
    if (filters.responsavel) {
      filtered = filtered.filter(atividade => atividade.responsavel === filters.responsavel);
    }
    
    setFilteredAtividades(filtered);
  };

  useEffect(() => {
    if (userSession?.obraAtiva) {
      loadAtividades();
    }
  }, [userSession?.obraAtiva]);

  useEffect(() => {
    applyFilters(filters);
  }, [atividades, filters]);

  const handleAtividadeToggle = async (atividadeId: string, concluida: boolean) => {
    try {
      await checklistService.atualizarAtividade(atividadeId, { concluida });
      
      setAtividades(prevAtividades => 
        prevAtividades.map(atividade => 
          atividade.id === atividadeId 
            ? { ...atividade, concluida }
            : atividade
        )
      );
      
      toast({
        title: concluida ? "Atividade concluída" : "Atividade marcada como não concluída",
        description: "Status atualizado com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao atualizar atividade",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAtividadeDelete = async (atividadeId: string) => {
    try {
      await checklistService.excluirAtividade(atividadeId);
      
      setAtividades(prevAtividades => 
        prevAtividades.filter(atividade => atividade.id !== atividadeId)
      );
      
      toast({
        title: "Atividade excluída",
        description: "Atividade removida com sucesso",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao excluir atividade",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!userSession?.obraAtiva) {
    return (
      <div className="flex-1 px-6 py-8 ml-4">
        <div className="text-center text-muted-foreground mt-20">
          Selecione uma obra para visualizar o checklist
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-8 ml-4">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <CheckSquare className="h-7 w-7 mr-3 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">Checklist de Atividades</h1>
        </div>
        <p className="text-muted-foreground ml-10">Gerencie as atividades do projeto</p>
      </div>
      
      {/* Main Content Card */}
      <div className="glass-card rounded-xl shadow-sm border border-border/50">
        {/* Form Section */}
        <div className="p-6 border-b border-border/20">
          <ChecklistForm onAtividadeCriada={loadAtividades} />
        </div>
        
        {/* Filters Section */}
        <div className="p-6 border-b border-border/20 bg-muted/20">
          <ChecklistFilters 
            onFiltersChange={applyFilters}
            uniqueLocais={uniqueValues.uniqueLocais}
            uniqueSetores={uniqueValues.uniqueSetores}
            uniqueResponsaveis={uniqueValues.uniqueResponsaveis}
          />
        </div>
        
        {/* Stats Section */}
        <div className="p-6 border-b border-border/20">
          <ChecklistStats atividades={filteredAtividades} />
        </div>
        
        {/* Table Section */}
        <div className="rounded-b-xl overflow-hidden">
          <ChecklistTable 
            atividades={filteredAtividades} 
            isLoading={isLoading}
            onAtividadeToggle={handleAtividadeToggle}
            onAtividadeDelete={handleAtividadeDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ChecklistContent;
