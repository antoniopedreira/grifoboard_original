
import { useState, useEffect, useCallback } from "react";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { calculatePCP } from "@/utils/pcp";
import { formatDateToISO, convertTarefaToTask } from "@/utils/taskUtils";
import { useTaskFilters } from "@/hooks/task/useTaskFilters";
import { useTaskActions } from "@/hooks/task/useTaskActions";
import { useTaskData } from "@/hooks/task/useTaskData";

export const useTaskManager = (weekStartDate: Date) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our extracted hooks
  const { filterTasksByWeek, filteredTasks, setFilteredTasks } = useTaskFilters(tasks, weekStartDate);
  const { loadTasks } = useTaskData(session, toast, setTasks, setIsLoading);
  
  // Função para calcular dados do PCP com base nas tarefas
  const calculatePCPData = useCallback((tasksList: Task[]) => {
    const pcpData = calculatePCP(tasksList);
    setWeeklyPCPData([pcpData]);
    return pcpData;
  }, []);
  
  // Task actions with dependencies injected
  const { 
    handleTaskUpdate, 
    handleTaskDelete, 
    handleTaskCreate,
    handleTaskDuplicate
  } = useTaskActions({
    toast,
    tasks,
    setTasks,
    weekStartDate,
    filterTasksByWeek,
    calculatePCPData,
    setFilteredTasks,
    session
  });
  
  // Carregar tarefas quando a obra ativa mudar ou a data da semana mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks(weekStartDate, calculatePCPData, filterTasksByWeek, setFilteredTasks);
    }
  }, [session.obraAtiva, weekStartDate, loadTasks, calculatePCPData, filterTasksByWeek, setFilteredTasks]);

  // Quando a semana muda, atualizar a lista filtrada
  useEffect(() => {
    setFilteredTasks(filterTasksByWeek(tasks, weekStartDate));
    // Recalculate PCP data for the filtered tasks
    calculatePCPData(filterTasksByWeek(tasks, weekStartDate));
  }, [weekStartDate, tasks, filterTasksByWeek, calculatePCPData, setFilteredTasks]);

  // Calcular PCP atual baseado nas tarefas filtradas da semana
  const pcpData = calculatePCP(filteredTasks);
  
  return {
    tasks: filteredTasks, // Return filtered tasks instead of all tasks
    allTasks: tasks,      // Keep all tasks for reference
    isLoading,
    pcpData,
    weeklyPCPData,
    loadTasks: (callback?: () => void) => loadTasks(weekStartDate, calculatePCPData, filterTasksByWeek, setFilteredTasks, callback),
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate
  };
};

// Re-export these utility functions from this file for compatibility
export { formatDateToISO, convertTarefaToTask } from "@/utils/taskUtils";
