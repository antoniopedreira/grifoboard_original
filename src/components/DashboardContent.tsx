
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
        </div>
        <div className="text-center py-5 text-gray-500">
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
      {/* Dashboard Header with Glassmorphism */}
      <div className="relative mb-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="absolute inset-0 bg-white/5 rounded-xl backdrop-blur-[2px] z-0"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            {userSession?.obraAtiva?.nome_obra || "Obra"}
          </p>
        </div>
      </div>
      
      {/* Week Navigation */}
      <WeekNavigation 
        weekStartDate={weekStartDate} 
        weekEndDate={weekEndDate} 
        onPreviousWeek={navigateToPreviousWeek} 
        onNextWeek={navigateToNextWeek} 
      />
      
      {/* Task Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-500">Total de Tarefas</h3>
              <p className="text-3xl font-bold mt-1">{tasks.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-500">Concluídas</h3>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {tasks.filter(task => task.isFullyCompleted).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-500">Não Realizadas</h3>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {tasks.filter(task => !task.isFullyCompleted).length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-500">PCP Semanal</h3>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {pcpData?.overall?.percentage ? `${Math.round(pcpData.overall.percentage)}%` : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progresso Semanal - Gráfico de barras com PCP por semana */}
      <Card className="border shadow-md mt-6 overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-medium">Progresso Semanal</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <PCPWeeklyChart weeklyData={weeklyPCPData} />
        </CardContent>
      </Card>
      
      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Executor Chart */}
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-medium">PCP por Executante</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[320px]">
              <ExecutorChart weekStartDate={weekStartDate} />
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Team Chart */}
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-medium">PCP por Equipe</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[320px]">
              <TeamChart weekStartDate={weekStartDate} />
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Responsible Chart */}
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-medium">PCP por Responsável</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[320px]">
              <ResponsibleChart weekStartDate={weekStartDate} />
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Cable Chart */}
        <Card className="border shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-lg font-medium">PCP por Cabo</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[320px]">
              <CableChart weekStartDate={weekStartDate} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
