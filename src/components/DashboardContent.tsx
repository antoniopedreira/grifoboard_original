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
import { BarChart3, CheckCircle2, Calendar, TrendingUp, Activity } from "lucide-react";

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
      <div className="min-h-screen bg-grifo-bg">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Loading Header */}
          <div className="grifo-card p-8 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-grifo-lg"></div>
              <div>
                <div className="h-8 w-48 bg-primary/20 rounded-grifo"></div>
                <div className="h-4 w-32 bg-muted/60 rounded-grifo mt-2"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Navigation */}
          <div className="grifo-card p-4 animate-pulse">
            <div className="h-12 bg-muted/40 rounded-grifo"></div>
          </div>
          
          {/* Loading Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grifo-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-grifo-lg"></div>
                  <div className="text-right">
                    <div className="h-8 w-12 bg-muted/40 rounded-grifo"></div>
                    <div className="h-3 w-16 bg-muted/30 rounded-grifo mt-1"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-muted/40 rounded-grifo"></div>
              </div>
            ))}
          </div>
          
          {/* Loading Chart */}
          <div className="grifo-card p-6 animate-pulse">
            <div className="h-64 bg-muted/40 rounded-grifo"></div>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.isFullyCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isFullyCompleted).length;
  const pcpPercentage = pcpData?.overall?.percentage ? Math.round(pcpData.overall.percentage) : 0;

  return (
    <div className="min-h-screen bg-grifo-bg">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header com microcopy */}
        <div className="mb-8">
          <h1 className="grifo-h1 mb-2">Dashboard</h1>
          <p className="grifo-body text-muted-foreground">
            Acompanhe o desempenho das obras em tempo real
          </p>
        </div>
        
        {/* WeekBar central */}
        <div className="grifo-card p-6">
          <WeekNavigation 
            weekStartDate={weekStartDate} 
            weekEndDate={weekEndDate} 
            onPreviousWeek={navigateToPreviousWeek} 
            onNextWeek={navigateToNextWeek} 
          />
        </div>
        
        {/* KPIs executivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="grifo-card p-6 cursor-pointer grifo-interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-grifo-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="grifo-h2 text-accent">{tasks.length}</div>
                <div className="grifo-small">Total</div>
              </div>
            </div>
            <h3 className="grifo-body font-semibold">Total de Tarefas</h3>
            <p className="grifo-small mt-1">Esta semana</p>
          </div>
          
          <div className="grifo-card p-6 cursor-pointer grifo-interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success/10 rounded-grifo-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div className="text-right">
                <div className="grifo-h2 text-success">{completedTasks}</div>
                <div className="grifo-small">Concluídas</div>
              </div>
            </div>
            <h3 className="grifo-body font-semibold">Tarefas Concluídas</h3>
            <p className="grifo-small mt-1">
              {Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% do total
            </p>
          </div>
          
          <div className="grifo-card p-6 cursor-pointer grifo-interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-grifo-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-destructive" />
              </div>
              <div className="text-right">
                <div className="grifo-h2 text-destructive">{pendingTasks}</div>
                <div className="grifo-small">Pendentes</div>
              </div>
            </div>
            <h3 className="grifo-body font-semibold">Não Realizadas</h3>
            <p className="grifo-small mt-1">Requer atenção</p>
          </div>
          
          <div className="grifo-card p-6 cursor-pointer grifo-interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-grifo-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right">
                <div className="grifo-h2 text-primary">{pcpPercentage}%</div>
                <div className="grifo-small">Performance</div>
              </div>
            </div>
            <h3 className="grifo-body font-semibold">PCP Semanal</h3>
            <p className="grifo-small mt-1">Índice de produção</p>
          </div>
        </div>
        
        {/* Gráfico principal */}
        <div className="grifo-card p-6">
          <div className="mb-6">
            <h2 className="grifo-h3 mb-2">Progresso Semanal</h2>
            <p className="grifo-small text-muted-foreground">Análise detalhada do PCP por semana</p>
          </div>
          <div className="grifo-surface p-4 rounded-grifo">
            <PCPWeeklyChart weeklyData={weeklyPCPData} />
          </div>
        </div>
        
        {/* Grid de gráficos analíticos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grifo-card p-6">
            <ExecutorChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="grifo-card p-6">
            <TeamChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="grifo-card p-6">
            <ResponsibleChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="grifo-card p-6">
            <CableChart weekStartDate={weekStartDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;