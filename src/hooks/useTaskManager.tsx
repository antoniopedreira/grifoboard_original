import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, DayOfWeek, TaskStatus, PCPBreakdown, WeeklyPCPData } from "@/types";
import { Tarefa } from "@/types/supabase";
import { calculatePCP, generateWeeklyPCPData, storeHistoricalPCPData } from "@/utils/pcp";
import { tarefasService } from "@/services/tarefaService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Format ISO date to YYYY-MM-DD
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

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
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  const [historicalPCPData, setHistoricalPCPData] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Enhanced PCP data calculation to include team, executor, and cable
  const calculateEnhancedPCP = useCallback((tasksList: Task[]) => {
    // Call the standard PCP calculation
    const standardPCP = calculatePCP(tasksList);
    
    // Create extended PCP data with additional breakdowns
    const pcpData: PCPBreakdown = {
      ...standardPCP,
      // Add new categories
      byTeam: {},
      byExecutor: {},
      byCable: {}
    };
    
    // Calculate by Team
    const tasksWithPlannedDays = tasksList.filter(task => task.plannedDays.length > 0);
    const teams = Array.from(new Set(tasksWithPlannedDays.map(task => task.team)));
    teams.forEach(team => {
      const teamTasks = tasksWithPlannedDays.filter(task => task.team === team);
      const teamCompletedTasks = teamTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byTeam[team] = {
        completedTasks: teamCompletedTasks,
        totalTasks: teamTasks.length,
        percentage: (teamCompletedTasks / teamTasks.length) * 100
      };
    });
    
    // Calculate by Executor
    const executors = Array.from(new Set(tasksWithPlannedDays.map(task => task.executor)));
    executors.forEach(executor => {
      const executorTasks = tasksWithPlannedDays.filter(task => task.executor === executor);
      const executorCompletedTasks = executorTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byExecutor[executor] = {
        completedTasks: executorCompletedTasks,
        totalTasks: executorTasks.length,
        percentage: (executorCompletedTasks / executorTasks.length) * 100
      };
    });
    
    // Calculate by Cable
    const cables = Array.from(new Set(tasksWithPlannedDays.map(task => task.cable)));
    cables.forEach(cable => {
      const cableTasks = tasksWithPlannedDays.filter(task => task.cable === cable);
      const cableCompletedTasks = cableTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byCable[cable] = {
        completedTasks: cableCompletedTasks,
        totalTasks: cableTasks.length,
        percentage: (cableCompletedTasks / cableTasks.length) * 100
      };
    });
    
    return pcpData;
  }, []);

  // Function to calculate weekly PCP data for the dashboard
  const calculateWeeklyPCPData = useCallback((tasksList: Task[], currentWeekStart: Date) => {
    const pcpData = calculateEnhancedPCP(tasksList);
    const currentWeekPCP = pcpData.overall.percentage;
    
    // Store historical data
    const updatedHistoricalData = storeHistoricalPCPData(
      historicalPCPData,
      currentWeekStart,
      currentWeekPCP
    );
    setHistoricalPCPData(updatedHistoricalData);
    
    // Generate weekly data
    const weeklyData = generateWeeklyPCPData(
      currentWeekStart,
      currentWeekPCP,
      updatedHistoricalData
    );
    setWeeklyPCPData(weeklyData);
    
    return pcpData;
  }, [calculateEnhancedPCP, historicalPCPData]);

  // Filter tasks based on week start date
  const filterTasksByWeek = useCallback((allTasks: Task[], startDate: Date) => {
    // Format the week start date for comparison (YYYY-MM-DD)
    const weekStartDateStr = formatDateToISO(startDate);
    
    return allTasks.filter(task => {
      // If task has no weekStartDate, skip it
      if (!task.weekStartDate) return false;
      
      // Format the task's week start date for comparison
      const taskWeekStartStr = formatDateToISO(task.weekStartDate);
      
      // Match tasks where the week start date is the same as the selected week
      return taskWeekStartStr === weekStartDateStr;
    });
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
      setTasks(convertedTasks);
      
      // Filter tasks for the current week
      const weekFilteredTasks = filterTasksByWeek(convertedTasks, weekStartDate);
      setFilteredTasks(weekFilteredTasks);
      
      // Calculate enhanced PCP data with weekly metrics
      calculateWeeklyPCPData(weekFilteredTasks, weekStartDate);
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
  }, [session.obraAtiva, toast, calculateWeeklyPCPData, filterTasksByWeek, weekStartDate]);
  
  // Carregar tarefas quando a obra ativa mudar ou a data da semana mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks();
    }
  }, [session.obraAtiva, weekStartDate, loadTasks]);

  // Quando a semana muda, atualizar a lista filtrada
  useEffect(() => {
    if (tasks.length > 0) {
      const filteredTasksList = filterTasksByWeek(tasks, weekStartDate);
      setFilteredTasks(filteredTasksList);
      // Recalculate PCP data for the filtered tasks
      calculateWeeklyPCPData(filteredTasksList, weekStartDate);
    }
  }, [weekStartDate, tasks, filterTasksByWeek, calculateWeeklyPCPData]);

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
        causa_nao_execucao: updatedTask.causeIfNotDone,
        // Convert Date to string format for database
        semana: updatedTask.weekStartDate ? formatDateToISO(updatedTask.weekStartDate) : undefined
      };
      
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
      
      // Update filtered tasks and PCP data
      const updatedFilteredTasks = filterTasksByWeek(updatedTasks, weekStartDate);
      setFilteredTasks(updatedFilteredTasks);
      calculateWeeklyPCPData(updatedFilteredTasks, weekStartDate);
      
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
  }, [tasks, toast, calculateWeeklyPCPData, filterTasksByWeek, weekStartDate]);
  
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
      calculateWeeklyPCPData(updatedFilteredTasks, weekStartDate);
      
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
  }, [tasks, toast, calculateWeeklyPCPData, filterTasksByWeek, weekStartDate]);
  
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
      
      // Adicionar a nova tarefa à lista local
      const updatedTasks = [novaTask, ...tasks];
      setTasks(updatedTasks);
      
      // Update filtered tasks and PCP data
      const updatedFilteredTasks = filterTasksByWeek(updatedTasks, weekStartDate);
      setFilteredTasks(updatedFilteredTasks);
      calculateWeeklyPCPData(updatedFilteredTasks, weekStartDate);
      
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
  }, [session.obraAtiva, tasks, toast, calculateWeeklyPCPData, filterTasksByWeek, weekStartDate]);
  
  // Calculate the enhanced PCP data for the current filtered tasks
  const pcpData = useMemo(() => calculateEnhancedPCP(filteredTasks), [filteredTasks, calculateEnhancedPCP]);
  
  return {
    tasks: filteredTasks, // Return filtered tasks instead of all tasks
    allTasks: tasks,      // Keep all tasks for reference
    isLoading,
    pcpData,
    weeklyPCPData,
    loadTasks,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate
  };
};
