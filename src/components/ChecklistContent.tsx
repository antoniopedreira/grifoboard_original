
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AtividadeChecklist } from "@/types/checklist";
import { checklistService } from "@/services/checklistService";
import ChecklistTable from "./ChecklistTable";
import ChecklistForm from "./ChecklistForm";
import { CheckSquare } from "lucide-react";

const ChecklistContent = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [atividades, setAtividades] = useState<AtividadeChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAtividades = async () => {
    if (!userSession?.obraAtiva) return;
    
    setIsLoading(true);
    try {
      console.log("Loading checklist activities for obra:", userSession.obraAtiva.id);
      const atividadesData = await checklistService.listarAtividades(userSession.obraAtiva.id);
      console.log("Checklist activities loaded:", atividadesData);
      
      setAtividades(atividadesData);
    } catch (error: any) {
      console.error("Error loading checklist activities:", error);
      toast({
        title: "Erro ao carregar atividades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userSession?.obraAtiva) {
      loadAtividades();
    }
  }, [userSession?.obraAtiva]);

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
    } catch (error: any) {
      console.error("Error updating activity:", error);
      toast({
        title: "Erro ao atualizar atividade",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!userSession?.obraAtiva) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Selecione uma obra para visualizar o checklist
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <CheckSquare className="h-6 w-6 mr-3 text-primary" />
        <h1 className="text-2xl font-heading font-semibold">Checklist de Atividades</h1>
      </div>
      
      <div className="glass-card rounded-xl shadow-sm">
        <div className="p-4">
          <ChecklistForm onAtividadeCriada={loadAtividades} />
        </div>
        <ChecklistTable 
          atividades={atividades} 
          isLoading={isLoading}
          onAtividadeToggle={handleAtividadeToggle}
        />
      </div>
    </div>
  );
};

export default ChecklistContent;
