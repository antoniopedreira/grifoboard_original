
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-light/10">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {/* Loading Header */}
          <div className="mb-10 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"></div>
              <div>
                <div className="h-10 w-48 bg-gradient-to-r from-muted to-muted/60 rounded-lg"></div>
                <div className="h-6 w-32 bg-muted/60 rounded-lg mt-2"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Navigation */}
          <div className="h-16 bg-gradient-to-r from-muted to-muted/60 rounded-2xl mb-8 animate-pulse"></div>
          
          {/* Loading Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="premium-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl"></div>
                  <div className="text-right">
                    <div className="h-8 w-16 bg-muted rounded-lg"></div>
                    <div className="h-4 w-12 bg-muted/60 rounded mt-1"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-muted rounded-lg"></div>
                <div className="h-3 w-20 bg-muted/60 rounded-lg mt-2"></div>
              </div>
            ))}
          </div>
          
          {/* Loading Chart */}
          <div className="premium-card p-8 mb-10 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-6 w-40 bg-muted rounded-lg"></div>
                <div className="h-4 w-56 bg-muted/60 rounded-lg mt-2"></div>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl"></div>
            </div>
            <div className="h-64 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl"></div>
          </div>
          
          {/* Loading Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="premium-card p-6 animate-pulse">
                <div className="h-6 w-32 bg-muted rounded-lg mb-4"></div>
                <div className="h-64 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-light/10">
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Modern Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-primary p-3 rounded-2xl shadow-glow">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {userSession?.obraAtiva?.nome_obra || "Obra"}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Week Navigation */}
        <div className="mb-8">
          <WeekNavigation 
            weekStartDate={weekStartDate} 
            weekEndDate={weekEndDate} 
            onPreviousWeek={navigateToPreviousWeek} 
            onNextWeek={navigateToNextWeek} 
          />
        </div>
        
        {/* Modern Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="interactive-card group cursor-default">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary-light p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <ClipboardList className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{tasks.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Total</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">Total de Tarefas</h3>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                Esta semana
              </div>
            </div>
          </div>
          
          <div className="interactive-card group cursor-default">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-success-light p-3 rounded-xl group-hover:bg-success group-hover:text-white transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-success group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-success">
                    {tasks.filter(task => task.isFullyCompleted).length}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Concluídas</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">Tarefas Concluídas</h3>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
                {Math.round((tasks.filter(task => task.isFullyCompleted).length / Math.max(tasks.length, 1)) * 100)}% do total
              </div>
            </div>
          </div>
          
          <div className="interactive-card group cursor-default">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-destructive-light p-3 rounded-xl group-hover:bg-destructive group-hover:text-white transition-all duration-300">
                  <CircleX className="h-6 w-6 text-destructive group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-destructive">
                    {tasks.filter(task => !task.isFullyCompleted).length}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Pendentes</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">Não Realizadas</h3>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-destructive mr-2"></div>
                Requer atenção
              </div>
            </div>
          </div>
          
          <div className="interactive-card group cursor-default">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-accent-light p-3 rounded-xl group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <CalendarDays className="h-6 w-6 text-accent group-hover:text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">
                    {pcpData?.overall?.percentage ? `${Math.round(pcpData.overall.percentage)}%` : '0%'}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Performance</div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-foreground">PCP Semanal</h3>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-accent mr-2"></div>
                Índice de produção
              </div>
            </div>
          </div>
        </div>
        
        {/* Weekly Progress Chart */}
        <div className="premium-card p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Progresso Semanal</h2>
              <p className="text-muted-foreground mt-1">Análise detalhada do PCP por semana</p>
            </div>
            <div className="bg-gradient-primary p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <PCPWeeklyChart weeklyData={weeklyPCPData} />
          </div>
        </div>
        
        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="premium-card p-6 hover:shadow-glow transition-all duration-500">
            <ExecutorChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="premium-card p-6 hover:shadow-glow transition-all duration-500">
            <TeamChart weekStartDate={weekStartDate} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="premium-card p-6 hover:shadow-glow transition-all duration-500">
            <ResponsibleChart weekStartDate={weekStartDate} />
          </div>
          
          <div className="premium-card p-6 hover:shadow-glow transition-all duration-500">
            <CableChart weekStartDate={weekStartDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
