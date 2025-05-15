
import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, PCPBreakdown, WeeklyPCPData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { tarefasService } from "@/services/tarefaService";
import { filterTasksByWeek } from "@/utils/taskFilters";
import { convertTarefaToTask } from "@/utils/taskConversion";
import { usePCPCalculation } from "./usePCPCalculation";
import { useTaskOperations } from "./useTaskOperations";
import { useTaskCreation } from "./useTaskCreation";

export const useTaskManager = (weekStartDate: Date) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  const [historicalPCPData, setHistoricalPCPData] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Hook to handle PCP calculations
  const { calculateEnhancedPCP, calculateWeeklyPCPData } = usePCPCalculation(
    historicalPCPData,
    setHistoricalPCPData
  );

  // Function to update tasks state and recalculate derived data
  const updateTasksState = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    const filteredTasksList = filterTasksByWeek(updatedTasks, weekStartDate);
    setFilteredTasks(filteredTasksList);
    
    // Recalculate PCP data
    const { weeklyData } = calculateWeeklyPCPData(filteredTasksList, weekStartDate);
    setWeeklyPCPData(weeklyData);
  }, [weekStartDate, calculateWeeklyPCPData]);

  // Hooks for task operations
  const { handleTaskUpdate, handleTaskDelete } = useTaskOperations(tasks, updateTasksState);
  const { handleTaskCreate } = useTaskCreation(session, tasks, weekStartDate, updateTasksState);

  // Function to load tasks from Supabase
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
      const { weeklyData } = calculateWeeklyPCPData(weekFilteredTasks, weekStartDate);
      setWeeklyPCPData(weeklyData);
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
  }, [session.obraAtiva, toast, calculateWeeklyPCPData, weekStartDate]);
  
  // Load tasks when the active obra changes or the week date changes
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks();
    }
  }, [session.obraAtiva, weekStartDate, loadTasks]);

  // When the week changes, update the filtered list
  useEffect(() => {
    if (tasks.length > 0) {
      const filteredTasksList = filterTasksByWeek(tasks, weekStartDate);
      setFilteredTasks(filteredTasksList);
      // Recalculate PCP data for the filtered tasks
      const { weeklyData } = calculateWeeklyPCPData(filteredTasksList, weekStartDate);
      setWeeklyPCPData(weeklyData);
    }
  }, [weekStartDate, tasks, calculateWeeklyPCPData]);
  
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
