
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WeekNavigation from "@/components/WeekNavigation";
import { getWeekStartDate } from "@/utils/pcp";
import { useTaskManager } from "@/hooks/useTaskManager";
import TaskProgressChart from "@/components/dashboard/TaskProgressChart";
import TaskDisciplineChart from "@/components/dashboard/TaskDisciplineChart";
import PerformanceTrendChart from "@/components/dashboard/PerformanceTrendChart";
import ResponsibleChart from "@/components/dashboard/ResponsibleChart";
import CableChart from "@/components/dashboard/CableChart";
import PCPWeeklyChart from "@/components/chart/PCPWeeklyChart";
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart2, PieChart, LineChart, UserCheck, Cable } from "lucide-react";

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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 15, stiffness: 100 }
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
        <motion.h1 
          className="text-2xl font-bold gradient-text mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Dashboard
        </motion.h1>
        <GlassCard className="flex items-center justify-center h-64">
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md mb-4 animate-spin-slow flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-accent" />
            </div>
            <p>Carregando dados...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto max-w-7xl px-4 py-6 bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-2xl font-bold gradient-text mb-6"
        variants={itemVariants}
      >
        Dashboard - {userSession?.obraAtiva?.nome_obra || "Obra"}
      </motion.h1>
      
      {/* Week Navigation */}
      <motion.div variants={itemVariants}>
        <WeekNavigation
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          onPreviousWeek={navigateToPreviousWeek}
          onNextWeek={navigateToNextWeek}
        />
      </motion.div>
      
      {/* Task Metrics Overview - Cards with counts */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        variants={itemVariants}
      >
        <GlassCard className="text-center hover:shadow-glass relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Total de Tarefas</h3>
          <p className="text-3xl font-bold mt-2 gradient-text">{tasks.length}</p>
        </GlassCard>
        <GlassCard className="text-center hover:shadow-glass relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/5 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <ArrowUpRight className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Concluídas</h3>
          <p className="text-3xl font-bold mt-2 text-green-500">
            {tasks.filter(task => task.isFullyCompleted).length}
          </p>
        </GlassCard>
        <GlassCard className="text-center hover:shadow-glass relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-red-500/5 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <ArrowUpRight className="h-6 w-6 text-red-500 rotate-180" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Não Realizadas</h3>
          <p className="text-3xl font-bold mt-2 text-red-500">
            {tasks.filter(task => 
              task.dailyStatus?.some(status => status.status === "not_done")
            ).length}
          </p>
        </GlassCard>
        <GlassCard className="text-center hover:shadow-glass relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent/5 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <PieChart className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">PCP Semanal</h3>
          <p className="text-3xl font-bold mt-2 text-accent">
            {pcpData?.overall?.percentage ? `${Math.round(pcpData.overall.percentage)}%` : '0%'}
          </p>
        </GlassCard>
      </motion.div>
      
      {/* Progresso Semanal - Gráfico de barras com PCP por semana */}
      <motion.div variants={itemVariants} className="mt-6">
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center">
              <GlassCardTitle>Progresso Semanal</GlassCardTitle>
              <BarChart2 className="h-5 w-5 text-accent opacity-70" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <PCPWeeklyChart weeklyData={weeklyPCPData} />
          </GlassCardContent>
        </GlassCard>
      </motion.div>
      
      {/* Dashboard Charts */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
        variants={itemVariants}
      >
        {/* Responsible Task Distribution - Updated to show week-specific data */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center">
              <GlassCardTitle>Tarefas por Responsável</GlassCardTitle>
              <UserCheck className="h-5 w-5 text-accent opacity-70" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <ResponsibleChart weekStartDate={weekStartDate} />
          </GlassCardContent>
        </GlassCard>
        
        {/* Cable Chart - Added to show week-specific data */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center">
              <GlassCardTitle>Tarefas por Cabo</GlassCardTitle>
              <Cable className="h-5 w-5 text-accent opacity-70" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <CableChart weekStartDate={weekStartDate} />
          </GlassCardContent>
        </GlassCard>
        
        {/* Tasks by Discipline */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center">
              <GlassCardTitle>Tarefas por Disciplina</GlassCardTitle>
              <PieChart className="h-5 w-5 text-accent opacity-70" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <TaskDisciplineChart tasks={tasks} />
          </GlassCardContent>
        </GlassCard>
        
        {/* Performance Trend */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex justify-between items-center">
              <GlassCardTitle>Tendência de Desempenho</GlassCardTitle>
              <LineChart className="h-5 w-5 text-accent opacity-70" />
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <PerformanceTrendChart weeklyPCPData={weeklyPCPData} />
          </GlassCardContent>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default DashboardContent;
