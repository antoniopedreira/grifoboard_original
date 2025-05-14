
import { useState, useEffect, useCallback } from "react";
import { Task, DayOfWeek, TaskStatus } from "@/types";
import { Tarefa } from "@/types/supabase";
import { calculatePCP } from "@/utils/pcp";
import { tarefasService } from "@/services/tarefaService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Função auxiliar para converter Tarefa para Task
export const convertTarefaToTask = (tarefa: Tarefa): Task => {
  const task: Task = {
    id: tarefa.id,
    sector: tarefa.setor,
    item: tarefa.item,
    description: tarefa.descricao,
    discipline: tarefa.disciplina,
    team: tarefa.equipe,
    responsible: tarefa.responsavel,
    executor: tarefa.executante,
    cable: tarefa.cabo,
    // Convert daily status fields to plannedDays array
    plannedDays: [],
    dailyStatus: [], 
    isFullyCompleted: tarefa.percentual_executado === 1,
    causeIfNotDone: tarefa.causa_nao_execucao,
    // Convert string to Date
    weekStartDate: tarefa.semana ? new Date(tarefa.semana) : undefined
  };
  
  // Process daily status from individual day fields
  const daysMapping: Record<string, DayOfWeek> = {
    'seg': 'mon',
    'ter': 'tue',
    'qua': 'wed',
    'qui': 'thu',
    'sex': 'fri',
    'sab': 'sat',
    'dom': 'sun'
  };
  
  // Add days to plannedDays if they exist in the tarefa
  Object.entries(daysMapping).forEach(([dbField, dayOfWeek]) => {
    const dayStatus = tarefa[dbField as keyof Tarefa];
    if (dayStatus === 'Planejada' || dayStatus === 'Executada' || dayStatus === 'Não Feita') {
      task.plannedDays.push(dayOfWeek);
      
      // Add day status to dailyStatus array
      let status: TaskStatus;
      if (dayStatus === 'Executada') {
        status = 'completed';
      } else if (dayStatus === 'Não Feita') {
        status = 'not_done';
      } else {
        status = 'planned';
      }
      
      task.dailyStatus.push({
        day: dayOfWeek,
        status
      });
    }
  });
  
  return task;
};

export const useTaskManager = (weekStartDate: Date) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para calcular dados do PCP com base nas tarefas
  const calculatePCPData = useCallback((tasksList: Task[]) => {
    const pcpData = calculatePCP(tasksList);
    setWeeklyPCPData([pcpData]);
    return pcpData;
  }, []);

  // Função para carregar tarefas do Supabase
  const loadTasks = useCallback(async () => {
    if (!session.obraAtiva) return;
    
    setIsLoading(true);
    try {
      console.log("Loading tasks for obra:", session.obraAtiva.id);
      const tarefas = await tarefasService.listarTarefas(session.obraAtiva.id);
      console.log("Tasks loaded:", tarefas);
      
      const convertedTasks = tarefas.map(convertTarefaToTask);
      
      // Filter tasks to only show tasks for the selected week
      const weekDateString = weekStartDate.toISOString().split('T')[0];
      const filteredTasks = convertedTasks.filter(task => {
        // If the task has a weekStartDate, compare it to the selected week
        if (task.weekStartDate) {
          const taskWeekDateString = task.weekStartDate.toISOString().split('T')[0];
          return taskWeekDateString === weekDateString;
        }
        return false;
      });
      
      console.log("Filtered tasks for week:", weekDateString, filteredTasks);
      setTasks(filteredTasks);
      
      // Calcular dados do PCP para o gráfico semanal
      calculatePCPData(filteredTasks);
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
  }, [session.obraAtiva, toast, calculatePCPData, weekStartDate]);
  
  // Carregar tarefas quando a obra ativa mudar ou a data da semana mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks();
    }
  }, [session.obraAtiva, weekStartDate, loadTasks]);

  // Função para atualizar uma tarefa
  const handleTaskUpdate = useCallback(async (updatedTask: Task) => {
    try {
      // Converter Task para Tarefa
      const tarefaToUpdate: Partial<Tarefa> = {
        setor: updatedTask.sector,
        item: updatedTask.item,
        descricao: updatedTask.description,
        disciplina: updatedTask.discipline,
        equipe: updatedTask.team,
        responsavel: updatedTask.responsible,
        executante: updatedTask.executor,
        cabo: updatedTask.cable,
        percentual_executado: updatedTask.isFullyCompleted ? 1 : 0,
        causa_nao_execucao: updatedTask.causeIfNotDone
      };
      
      // Update week start date if provided
      if (updatedTask.weekStartDate) {
        tarefaToUpdate.semana = updatedTask.weekStartDate.toISOString().split('T')[0];
      }
      
      // Update day status fields
      if (updatedTask.dailyStatus && updatedTask.dailyStatus.length > 0) {
        const daysMapping: Record<DayOfWeek, string> = {
          'mon': 'seg',
          'tue': 'ter',
          'wed': 'qua',
          'thu': 'qui',
          'fri': 'sex',
          'sat': 'sab',
          'sun': 'dom'
        };
        
        updatedTask.dailyStatus.forEach(dailyStatus => {
          const dbField = daysMapping[dailyStatus.day];
          if (dbField) {
            let status = '';
            
            if (dailyStatus.status === 'completed') {
              status = 'Executada';
            } else if (dailyStatus.status === 'not_done') {
              status = 'Não Feita';
            } else if (dailyStatus.status === 'planned') {
              status = 'Planejada';
            }
            
            // Type assertion to handle dynamic field assignments
            (tarefaToUpdate as any)[dbField] = status;
          }
        });
      }
      
      await tarefasService.atualizarTarefa(updatedTask.id, tarefaToUpdate);
      
      // Atualizar a tarefa localmente
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      calculatePCPData(updatedTasks);
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      return updatedTask;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [tasks, toast, calculatePCPData]);
  
  // Função para excluir uma tarefa
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await tarefasService.excluirTarefa(taskId);
      
      // Remover a tarefa localmente
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      calculatePCPData(updatedTasks);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [tasks, toast, calculatePCPData]);
  
  // Função para criar uma nova tarefa
  const handleTaskCreate = useCallback(async (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Ensure weekStartDate is set, or use the current week
      const taskWeekStartDate = newTaskData.weekStartDate || weekStartDate;
      
      // Initialize the new Tarefa object with required fields
      const novaTarefa: Omit<Tarefa, 'id' | 'created_at'> = {
        obra_id: session.obraAtiva.id,
        setor: newTaskData.sector,
        item: newTaskData.item,
        descricao: newTaskData.description,
        disciplina: newTaskData.discipline,
        equipe: newTaskData.team,
        responsavel: newTaskData.responsible,
        executante: newTaskData.executor,
        cabo: newTaskData.cable,
        semana: taskWeekStartDate.toISOString().split('T')[0],
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
      const dayMapping: Record<DayOfWeek, keyof Omit<Tarefa, 'id' | 'created_at'>> = {
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
        (novaTarefa as any)[dbField] = 'Planejada';
      });
      
      console.log("Creating task with data:", novaTarefa);
      // Criar tarefa no Supabase
      const createdTarefa = await tarefasService.criarTarefa(novaTarefa);
      
      // Converter a tarefa para Task antes de adicionar à lista local
      const novaTask = convertTarefaToTask(createdTarefa);
      
      // Only add to the current tasks list if the weekStartDate matches
      if (taskWeekStartDate.toISOString().split('T')[0] === weekStartDate.toISOString().split('T')[0]) {
        // Adicionar a nova tarefa à lista local
        const updatedTasks = [novaTask, ...tasks];
        setTasks(updatedTasks);
        
        // Atualizar dados do PCP
        calculatePCPData(updatedTasks);
      } else {
        // If the task is for a different week, we don't add it to the current list
        // but we should notify the user that the task was created for a different week
        toast({
          title: "Tarefa criada para outra semana",
          description: `A tarefa foi adicionada para a semana de ${taskWeekStartDate.toLocaleDateString()}.`,
        });
      }
      
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso.",
      });
      
      return novaTask;
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [session.obraAtiva, tasks, toast, calculatePCPData, weekStartDate]);
  
  // Calcular PCP atual
  const pcpData = calculatePCP(tasks);
  
  return {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    loadTasks,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate
  };
};
