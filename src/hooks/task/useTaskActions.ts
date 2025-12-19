
import { useCallback } from "react";
import { Task } from "@/types";
import { Tarefa } from "@/types/supabase";
import { tarefasService } from "@/services/tarefaService";
import { gamificationService } from "@/services/gamificationService";
import { useAuth } from "@/context/AuthContext";
import { convertTarefaToTask, convertTaskStatusToTarefa, formatDateToISO } from "@/utils/taskUtils";
import { getErrorMessage } from "@/lib/utils/errorHandler";

type ToastType = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type SessionType = {
  obraAtiva?: { id: string; nome_obra?: string };
};

type TaskActionsProps = {
  toast: (props: ToastType) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  weekStartDate: Date;
  filterTasksByWeek: (tasks: Task[], startDate: Date) => Task[];
  calculatePCPData: (tasks: Task[]) => any;
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  session: SessionType;
};

export const useTaskActions = ({
  toast,
  tasks,
  setTasks,
  weekStartDate,
  filterTasksByWeek,
  calculatePCPData,
  setFilteredTasks,
  session
}: TaskActionsProps) => {
  const { userSession } = useAuth();
  
  // Função para atualizar uma tarefa
  const handleTaskUpdate = useCallback(async (updatedTask: Task, previousTask?: Task) => {
    try {
      // Converter Task para Tarefa
      const tarefaToUpdate = convertTaskStatusToTarefa(updatedTask);
      
      await tarefasService.atualizarTarefa(updatedTask.id, tarefaToUpdate);
      
      // Atualizar a tarefa localmente
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      
      // Update filtered tasks and PCP data
      const updatedFilteredTasks = filterTasksByWeek(updatedTasks, weekStartDate);
      setFilteredTasks(updatedFilteredTasks);
      calculatePCPData(updatedFilteredTasks);
      
      // === GAMIFICAÇÃO: +30 XP quando tarefa é marcada como concluída ===
      if (updatedTask.isFullyCompleted && userSession?.user?.id) {
        console.log("🎮 Disparando XP: Tarefa concluída", updatedTask.id);
        await gamificationService.awardXP(
          userSession.user.id,
          'TAREFA_CONCLUIDA',
          30,
          updatedTask.id
        );
      }
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      return updatedTask;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [tasks, toast, calculatePCPData, filterTasksByWeek, weekStartDate, setTasks, setFilteredTasks, userSession?.user?.id]);
  
  // Função para excluir uma tarefa
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await tarefasService.excluirTarefa(taskId);
      
      // Remover a tarefa localmente
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Update filtered tasks and PCP data
      const updatedFilteredTasks = filterTasksByWeek(updatedTasks, weekStartDate);
      setFilteredTasks(updatedFilteredTasks);
      calculatePCPData(updatedFilteredTasks);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
      
      return true;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Erro ao excluir tarefa",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [tasks, toast, calculatePCPData, filterTasksByWeek, weekStartDate, setTasks, setFilteredTasks]);
  
  // Função para criar uma nova tarefa
  const handleTaskCreate = useCallback(async (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Ensure we have a week start date
      if (!newTaskData.weekStartDate) {
        throw new Error("Data de início da semana (segunda-feira) é obrigatória");
      }
      
      // Initialize the new Tarefa object with required fields
      // Gerar item automaticamente se não fornecido
      const itemValue = newTaskData.item || `${newTaskData.sector}-${Date.now()}`;
      
      const novaTarefa: Omit<Tarefa, 'id' | 'created_at'> = {
        obra_id: session.obraAtiva.id,
        setor: newTaskData.sector,
        item: itemValue,
        descricao: newTaskData.description,
        disciplina: newTaskData.discipline,
        executante: newTaskData.team,
        responsavel: newTaskData.responsible,
        encarregado: newTaskData.executor,
        // Store the date in ISO format (YYYY-MM-DD)
        semana: formatDateToISO(newTaskData.weekStartDate),
        percentual_executado: 0,
        causa_nao_execucao: newTaskData.causeIfNotDone,
        seg: null,
        ter: null,
        qua: null,
        qui: null,
        sex: null,
        sab: null,
        dom: null
      };
      
      // Set day status based on plannedDays
      const dayMapping: Record<string, string> = {
        'mon': 'seg',
        'tue': 'ter',
        'wed': 'qua',
        'thu': 'qui',
        'fri': 'sex',
        'sat': 'sab',
        'sun': 'dom'
      };
      
      // Set planned days
      newTaskData.plannedDays.forEach(day => {
        const dbField = dayMapping[day];
        // Type assertion to handle dynamic field assignments
        (novaTarefa as Record<string, unknown>)[dbField] = 'Planejada';
      });
      
      
      // Criar tarefa no Supabase
      const createdTarefa = await tarefasService.criarTarefa(novaTarefa);
      
      // Converter a tarefa para Task antes de adicionar à lista local
      const novaTask = convertTarefaToTask(createdTarefa);
      
      // Adicionar a nova tarefa à lista local
      const updatedTasks = [novaTask, ...tasks];
      setTasks(updatedTasks);
      
      // Update filtered tasks and PCP data
      const updatedFilteredTasks = filterTasksByWeek(updatedTasks, weekStartDate);
      setFilteredTasks(updatedFilteredTasks);
      calculatePCPData(updatedFilteredTasks);
      
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso.",
      });
      
      return novaTask;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Erro ao criar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [session.obraAtiva, tasks, toast, calculatePCPData, filterTasksByWeek, weekStartDate, setTasks, setFilteredTasks]);
  
  // New function to duplicate a task
  const handleTaskDuplicate = useCallback(async (taskToDuplicate: Task) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Create new task data based on the existing task but without the id
      const newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted"> = {
        sector: taskToDuplicate.sector,
        item: taskToDuplicate.item,
        description: taskToDuplicate.description,
        discipline: taskToDuplicate.discipline,
        team: taskToDuplicate.team,
        responsible: taskToDuplicate.responsible,
        executor: taskToDuplicate.executor,
        plannedDays: [...taskToDuplicate.plannedDays], // Copy planned days
        weekStartDate: taskToDuplicate.weekStartDate, // Keep same week
        causeIfNotDone: taskToDuplicate.causeIfNotDone,
      };
      
      // Use the existing create function to make a new task
      const createdTask = await handleTaskCreate(newTaskData);
      
      toast({
        title: "Tarefa duplicada",
        description: "Uma nova cópia da tarefa foi criada com sucesso.",
      });
      
      return createdTask;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Erro ao duplicar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [session.obraAtiva, handleTaskCreate, toast]);
  
  // New function to copy a task to next week
  const handleCopyToNextWeek = useCallback(async (taskToDuplicate: Task) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Calculate next week's Monday
      const currentWeekStart = taskToDuplicate.weekStartDate || new Date();
      const nextWeekStart = new Date(
        currentWeekStart.getFullYear(), 
        currentWeekStart.getMonth(), 
        currentWeekStart.getDate() + 7
      );
      
      // Create new task data based on the existing task but with next week's date
      const newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted"> = {
        sector: taskToDuplicate.sector,
        item: taskToDuplicate.item,
        description: taskToDuplicate.description,
        discipline: taskToDuplicate.discipline,
        team: taskToDuplicate.team,
        responsible: taskToDuplicate.responsible,
        executor: taskToDuplicate.executor,
        plannedDays: [...taskToDuplicate.plannedDays], // Copy planned days
        weekStartDate: nextWeekStart, // Set to next week's Monday
        causeIfNotDone: taskToDuplicate.causeIfNotDone,
      };
      
      // Use the existing create function to make a new task
      const createdTask = await handleTaskCreate(newTaskData);
      
      toast({
        title: "Tarefa copiada para próxima semana",
        description: "Uma nova tarefa foi criada para a semana seguinte.",
      });
      
      return createdTask;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Erro ao copiar tarefa",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [session.obraAtiva, handleTaskCreate, toast]);
  
  return {
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate,
    handleCopyToNextWeek
  };
};
