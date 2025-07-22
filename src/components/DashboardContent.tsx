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
      <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Loading Header */}
          <div className="glass-card p-8 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-lg"></div>
              <div>
                <div className="h-8 w-48 bg-muted rounded"></div>
                <div className="h-4 w-32 bg-muted/60 rounded mt-2"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Navigation */}
          <div className="glass-card p-4 animate-pulse">
            <div className="h-12 bg-muted rounded"></div>
          </div>
          
          {/* Loading Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="text-right">
                    <div className="h-8 w-12 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted/60 rounded mt-1"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Loading Chart */}
          <div className="glass-card p-6 animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.isFullyCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isFullyCompleted).length;
  const pcpPercentage = pcpData?.overall?.percentage ? Math.round(pcpData.overall.percentage) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Clean Header */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                  {userSession?.obraAtiva?.nome_obra || "Obra"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span>Atualizado agora</span>
            </div>
          </div>
        </div>
        
        {/* Week Navigation */}
        <WeekNavigation 
          weekStartDate={weekStartDate} 
          weekEndDate={weekEndDate} 
          onPreviousWeek={navigateToPreviousWeek} 
          onNextWeek={navigateToNextWeek} 
        />
        
        {/* Clean Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="minimal-card p-6 interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-foreground">{tasks.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">Total de Tarefas</h3>
            <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
          </div>
          
          <div className="minimal-card p-6 interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-success">{completedTasks}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">Tarefas Concluídas</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% do total
            </p>
          </div>
          
          <div className="minimal-card p-6 interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-destructive">{pendingTasks}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">Não Realizadas</h3>
            <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
          </div>
          
          <div className="minimal-card p-6 interactive">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-primary">{pcpPercentage}%</div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-foreground">PCP Semanal</h3>
            <p className="text-xs text-muted-foreground mt-1">Índice de produção</p>
          </div>
        </div>
        
        {/* Weekly Progress Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Progresso Semanal</h2>
              <p className="text-sm text-muted-foreground">Análise detalhada do PCP por semana</p>
            </div>
          </div>
          <div className="bg-background/50 rounded-lg p-4">
            <PCPWeeklyChart weeklyData={weeklyPCPData} />
          </div>
        </div>
        
        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="minimal-card p-6">
            <ExecutorChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="minimal-card p-6">
            <TeamChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="minimal-card p-6">
            <ResponsibleChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="minimal-card p-6">
            <CableChart weekStartDate={weekStartDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;