import { useState, useEffect, useCallback } from "react";
import { Task, WeeklyPCPData, PCPBreakdown } from "@/types";
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

  // CORREÇÃO: Restaurado o estado de weeklyPCPData para compatibilidade com MainPageContent
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { filterTasksByWeek, filteredTasks, setFilteredTasks } = useTaskFilters(tasks, weekStartDate);
  const { loadTasks } = useTaskData(session, toast, setTasks, setIsLoading);

  // Função para calcular dados do PCP
  const calculatePCPData = useCallback(
    (tasksList: Task[]) => {
      // Proteção contra undefined
      const safeList = tasksList || [];
      const pcpData = calculatePCP(safeList);

      // CORREÇÃO: Recriando o objeto weeklyPCPData necessário para o componente PCPSection
      const weeklyData: WeeklyPCPData = {
        week: "Atual",
        percentage: pcpData.overall.percentage,
        date: weekStartDate,
        isCurrentWeek: true,
      };
      setWeeklyPCPData([weeklyData]);

      return pcpData;
    },
    [weekStartDate],
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

  // Carregar tarefas quando a obra ativa mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks(weekStartDate, calculatePCPData, filterTasksByWeek, setFilteredTasks);
    } else {
      setTasks([]);
      setFilteredTasks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.obraAtiva]);

  // Atualizar lista filtrada ao mudar semana
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const filtered = filterTasksByWeek(tasks, weekStartDate);
      setFilteredTasks(filtered);
      calculatePCPData(filtered);
    }
  }, [weekStartDate, tasks, filterTasksByWeek, calculatePCPData, setFilteredTasks]);

  // Cálculo final seguro
  const pcpData = calculatePCP(filteredTasks || []);

  return {
    tasks: filteredTasks || [],
    allTasks: tasks || [],
    isLoading,
    pcpData,
    weeklyPCPData, // Propriedade restaurada para corrigir o erro
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
