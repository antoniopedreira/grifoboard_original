
import { useCallback } from "react";
import { Task } from "@/types";
import { tarefasService } from "@/services/tarefaService";
import { convertTarefaToTask } from "@/utils/taskUtils";

type ToastType = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type SessionType = {
  obraAtiva?: { id: string; nome_obra?: string };
};

export const useTaskData = (
  session: SessionType,
  toast: (props: ToastType) => void,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Função para carregar tarefas do Supabase
  const loadTasks = useCallback(async (
    weekStartDate: Date,
    calculatePCPData: (tasks: Task[]) => any,
    filterTasksByWeek: (tasks: Task[], startDate: Date) => Task[],
    setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    callback?: () => void
  ) => {
    if (!session.obraAtiva) {
      console.log("⚠️ No active obra, skipping task load");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("🔍 Loading tasks for obra:", session.obraAtiva.id, "for week:", weekStartDate.toDateString());
      const tarefas = await tarefasService.listarTarefas(session.obraAtiva.id);
      
      const convertedTasks = tarefas.map(convertTarefaToTask);
      console.log("📝 Converted tasks:", convertedTasks.length, "total tasks");
      
      setTasks(convertedTasks);
      
      // Filter tasks for the current week
      const weekFilteredTasks = filterTasksByWeek(convertedTasks, weekStartDate);
      console.log("📅 Week filtered tasks:", weekFilteredTasks.length, "tasks for this week");
      
      setFilteredTasks(weekFilteredTasks);
      
      // Calcular dados do PCP para o gráfico semanal com as tarefas filtradas
      calculatePCPData(weekFilteredTasks);
      
      // Execute callback if provided
      if (callback) callback();
    } catch (error: any) {
      console.error("❌ Error loading tasks:", error);
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session.obraAtiva, toast, setTasks, setIsLoading]);
  
  return { loadTasks };
};
