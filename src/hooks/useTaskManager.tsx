
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Tarefa } from "@/types/supabase";
import { calculatePCP } from "@/utils/pcp";
import { tarefasService } from "@/services/tarefaService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Função auxiliar para converter Tarefa para Task
export const convertTarefaToTask = (tarefa: Tarefa): Task => {
  const task: Task = {
    id: tarefa.id,
    sector: tarefa.sector,
    item: tarefa.item,
    description: tarefa.description,
    discipline: tarefa.discipline,
    team: tarefa.team,
    responsible: tarefa.responsible,
    executor: tarefa.executor,
    cable: tarefa.cable,
    plannedDays: tarefa.plannedDays,
    dailyStatus: tarefa.dailyStatus,
    isFullyCompleted: tarefa.isFullyCompleted,
    completionStatus: tarefa.completionStatus,
    causeIfNotDone: tarefa.causeIfNotDone,
    weekStartDate: tarefa.weekStartDate
  };
  return task;
};

export const useTaskManager = (weekStartDate: Date) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tarefas quando a obra ativa mudar ou a data da semana mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks();
    }
  }, [session.obraAtiva, weekStartDate]);

  const loadTasks = async () => {
    if (!session.obraAtiva) return;
    
    setIsLoading(true);
    try {
      const tarefas = await tarefasService.listarTarefas(session.obraAtiva.id);
      // Converter Tarefas para Tasks antes de atualizar o estado
      const convertedTasks = tarefas.map(convertTarefaToTask);
      setTasks(convertedTasks);
      
      // Calcular dados do PCP para o gráfico semanal
      const pcpData = calculatePCP(convertedTasks);
      setWeeklyPCPData([pcpData]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Extrair apenas os campos necessários para atualizar no Supabase
      const { id, ...taskUpdate } = updatedTask;
      await tarefasService.atualizarTarefa(id, taskUpdate);
      
      // Atualizar a tarefa localmente
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await tarefasService.excluirTarefa(taskId);
      
      // Remover a tarefa localmente
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleTaskCreate = async (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Criar tarefa no Supabase
      const novaTarefa = await tarefasService.criarTarefa(newTaskData, session.obraAtiva.id);
      
      // Converter a tarefa para Task antes de adicionar à lista local
      const novaTask = convertTarefaToTask(novaTarefa);
      
      // Adicionar a nova tarefa à lista local
      const updatedTasks = [novaTask, ...tasks];
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Calcular PCP
  const pcpData = calculatePCP(tasks);
  
  return {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate
  };
};
