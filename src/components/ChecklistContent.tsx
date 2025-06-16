
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types";
import { tarefasService } from "@/services/tarefaService";
import { convertTarefaToTask } from "@/utils/taskUtils";
import ChecklistTable from "./ChecklistTable";
import { CheckSquare } from "lucide-react";

const ChecklistContent = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar todas as tarefas da obra
  const loadTasks = async () => {
    if (!userSession?.obraAtiva) return;
    
    setIsLoading(true);
    try {
      console.log("Loading tasks for obra:", userSession.obraAtiva.id);
      const tarefas = await tarefasService.listarTarefas(userSession.obraAtiva.id);
      console.log("Tasks loaded:", tarefas);
      
      const convertedTasks = tarefas.map(convertTarefaToTask);
      setTasks(convertedTasks);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userSession?.obraAtiva) {
      loadTasks();
    }
  }, [userSession?.obraAtiva]);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await tarefasService.atualizarTarefa(taskId, {
        percentual_executado: completed ? 1 : 0
      });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, isFullyCompleted: completed }
            : task
        )
      );
      
      toast({
        title: completed ? "Tarefa concluída" : "Tarefa marcada como não concluída",
        description: "Status atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
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
        <h1 className="text-2xl font-heading font-semibold">Checklist de Tarefas</h1>
      </div>
      
      <div className="glass-card rounded-xl shadow-sm">
        <ChecklistTable 
          tasks={tasks} 
          isLoading={isLoading}
          onTaskToggle={handleTaskToggle}
        />
      </div>
    </div>
  );
};

export default ChecklistContent;
