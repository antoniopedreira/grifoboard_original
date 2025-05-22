
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WeekNavigation from "@/components/WeekNavigation";
import { getWeekStartDate } from "@/utils/pcp";
import { useTaskManager } from "@/hooks/useTaskManager";
import TaskProgressChart from "@/components/dashboard/TaskProgressChart";
import PCPWeeklyChart from "@/components/chart/PCPWeeklyChart";
import ExecutorChart from "@/components/dashboard/ExecutorChart";
import TeamChart from "@/components/dashboard/TeamChart";
import ResponsibleChart from "@/components/dashboard/ResponsibleChart";
import CableChart from "@/components/dashboard/CableChart";
import { BarChart3, CalendarDays, CheckCircle, CircleX, ClipboardList } from "lucide-react";

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
  const { tasks, isLoading, pcpData, weeklyPCPData } = useTaskManager(weekStartDate);

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
      <div className="container mx-auto max-w-7xl px-4 py-6 bg-background animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-md mb-8"></div>
        <div className="h-16 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
      <div className="flex items-center mb-8">
        <BarChart3 className="h-6 w-6 mr-3 text-primary" />
        <h1 className="text-2xl font-heading font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Dashboard - {userSession?.obraAtiva?.nome_obra || "Obra"}
        </h1>
      </div>
      
      {/* Week Navigation */}
      <WeekNavigation 
        weekStartDate={weekStartDate} 
        weekEndDate={weekEndDate} 
        onPreviousWeek={navigateToPreviousWeek} 
        onNextWeek={navigateToNextWeek} 
      />
      
      {/* Task Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 mb-8">
        <div className="glass-card rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 group">
          <div className="flex items-center">
            <div className="bg-blue-50 p-2 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total de Tarefas</h3>
              <p className="text-2xl font-bold mt-1">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 group">
          <div className="flex items-center">
            <div className="bg-green-50 p-2 rounded-lg mr-4 group-hover:bg-green-100 transition-colors">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Concluídas</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {tasks.filter(task => task.isFullyCompleted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 group">
          <div className="flex items-center">
            <div className="bg-red-50 p-2 rounded-lg mr-4 group-hover:bg-red-100 transition-colors">
              <CircleX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Não Realizadas</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {tasks.filter(task => !task.isFullyCompleted).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 group">
          <div className="flex items-center">
            <div className="bg-indigo-50 p-2 rounded-lg mr-4 group-hover:bg-indigo-100 transition-colors">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">PCP Semanal</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {pcpData?.overall?.percentage ? `${Math.round(pcpData.overall.percentage)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progresso Semanal - Gráfico de barras com PCP por semana */}
      <div className="glass-card rounded-xl p-6 shadow-sm mb-8 bg-white/90 backdrop-blur-sm border border-gray-100/40">
        <h2 className="text-lg font-medium font-heading mb-4 text-gray-800">Progresso Semanal</h2>
        <PCPWeeklyChart weeklyData={weeklyPCPData} />
      </div>
      
      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Executor Chart */}
        <div className="glass-card rounded-xl p-6 shadow-sm hover:shadow transition-shadow duration-200 bg-white/90 backdrop-blur-sm border border-gray-100/40">
          <ExecutorChart weekStartDate={weekStartDate} />
        </div>
        
        {/* Team Chart */}
        <div className="glass-card rounded-xl p-6 shadow-sm hover:shadow transition-shadow duration-200 bg-white/90 backdrop-blur-sm border border-gray-100/40">
          <TeamChart weekStartDate={weekStartDate} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Responsible Chart */}
        <div className="glass-card rounded-xl p-6 shadow-sm hover:shadow transition-shadow duration-200 bg-white/90 backdrop-blur-sm border border-gray-100/40">
          <ResponsibleChart weekStartDate={weekStartDate} />
        </div>
        
        {/* Cable Chart */}
        <div className="glass-card rounded-xl p-6 shadow-sm hover:shadow transition-shadow duration-200 bg-white/90 backdrop-blur-sm border border-gray-100/40">
          <CableChart weekStartDate={weekStartDate} />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
