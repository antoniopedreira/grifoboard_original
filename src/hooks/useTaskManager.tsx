import { useState, useEffect, useCallback, useMemo } from "react";
import { Task, WeeklyPCPData } from "@/types";
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
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { filterTasksByWeek, filteredTasks, setFilteredTasks } = useTaskFilters(tasks, weekStartDate);
  const { loadTasks } = useTaskData(session, toast, setTasks, setIsLoading);

  // Memoized PCP calculation to avoid recalculating on every render
  const pcpData = useMemo(() => {
    return calculatePCP(filteredTasks || []);
  }, [filteredTasks]);

  // Update weeklyPCPData when pcpData changes
  const updateWeeklyPCPData = useCallback((percentage: number) => {
    const weeklyData: WeeklyPCPData = {
      week: "Atual",
      percentage,
      date: weekStartDate,
      isCurrentWeek: true,
    };
    setWeeklyPCPData([weeklyData]);
  }, [weekStartDate]);

  // Simplified calculatePCPData for use in actions (only updates weeklyPCPData)
  const calculatePCPData = useCallback(
    (tasksList: Task[]) => {
      const safeList = tasksList || [];
      const data = calculatePCP(safeList);
      updateWeeklyPCPData(data.overall.percentage);
      return data;
    },
    [updateWeeklyPCPData],
  );

  const { handleTaskUpdate, handleTaskDelete, handleTaskCreate, handleTaskDuplicate, handleCopyToNextWeek } =
    useTaskActions({
      toast,
      tasks,
      setTasks,
      weekStartDate,
      filterTasksByWeek,
      calculatePCPData,
      setFilteredTasks,
      session,
    });

  // Load tasks when obraAtiva changes
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks(weekStartDate, calculatePCPData, filterTasksByWeek, setFilteredTasks);
    } else {
      setTasks([]);
      setFilteredTasks([]);
    }
  }, [session.obraAtiva]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter tasks and update weeklyPCPData when weekStartDate or tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const filtered = filterTasksByWeek(tasks, weekStartDate);
      setFilteredTasks(filtered);
      updateWeeklyPCPData(calculatePCP(filtered).overall.percentage);
    }
  }, [weekStartDate, tasks, filterTasksByWeek, setFilteredTasks, updateWeeklyPCPData]);

  return {
    tasks: filteredTasks || [],
    allTasks: tasks || [],
    isLoading,
    pcpData,
    weeklyPCPData,
    loadTasks: (callback?: () => void) =>
      loadTasks(weekStartDate, calculatePCPData, filterTasksByWeek, setFilteredTasks, callback),
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate,
    handleCopyToNextWeek,
  };
};

export { formatDateToISO, convertTarefaToTask } from "@/utils/taskUtils";
