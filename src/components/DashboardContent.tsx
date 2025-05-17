
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WeekNavigation from "@/components/WeekNavigation";
import { getWeekStartDate } from "@/utils/pcp";
import { useTaskManager } from "@/hooks/useTaskManager";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart";
import TaskProgressChart from "@/components/dashboard/TaskProgressChart";
import TaskDisciplineChart from "@/components/dashboard/TaskDisciplineChart";
import PerformanceTrendChart from "@/components/dashboard/PerformanceTrendChart";

const DashboardContent = () => {
  const { toast } = useToast();
  const { userSession } = useAuth();
  
  // Initialize with the current week's Monday
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState(new Date());

  // Calculate end of week when start date changes
  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  // Get task data from our custom hook
  const {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
  } = useTaskManager(weekStartDate);

  // Navigate to previous and next weeks
  const navigateToPreviousWeek = () => {
    const prevWeek = new Date(weekStartDate);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setWeekStartDate(prevWeek);
  };
  
  const navigateToNextWeek = () => {
    const nextWeek = new Date(weekStartDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setWeekStartDate(nextWeek);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="text-center py-10 text-gray-500">
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard - {userSession?.obraAtiva?.nome_obra || "Obra"}
      </h1>
      
      {/* Week Navigation */}
      <WeekNavigation
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        onPreviousWeek={navigateToPreviousWeek}
        onNextWeek={navigateToNextWeek}
      />
      
      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Task Status Distribution */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-4">Estado das Tarefas</h2>
          <TaskStatusChart tasks={tasks} />
        </div>
        
        {/* Task Progress */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-4">Progresso Semanal</h2>
          <TaskProgressChart pcpData={pcpData} />
        </div>
        
        {/* Tasks by Discipline */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-4">Tarefas por Disciplina</h2>
          <TaskDisciplineChart tasks={tasks} />
        </div>
        
        {/* Performance Trend */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-4">Tendência de Desempenho</h2>
          <PerformanceTrendChart weeklyPCPData={weeklyPCPData} />
        </div>
      </div>

      {/* Task Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Total de Tarefas</h3>
          <p className="text-3xl font-bold">{tasks.length}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Concluídas</h3>
          <p className="text-3xl font-bold text-green-600">
            {tasks.filter(task => task.isFullyCompleted).length}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Não Realizadas</h3>
          <p className="text-3xl font-bold text-red-600">
            {tasks.filter(task => 
              task.dailyStatus?.some(status => status.status === "not_done")
            ).length}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-white shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">PCP Semanal</h3>
          <p className="text-3xl font-bold text-blue-600">
            {pcpData?.overall?.percentage ? `${Math.round(pcpData.overall.percentage)}%` : '0%'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
