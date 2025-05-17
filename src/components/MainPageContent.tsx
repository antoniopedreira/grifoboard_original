
import { useState, useEffect } from "react";
import TaskForm from "@/components/TaskForm";
import WeekNavigation from "@/components/WeekNavigation";
import RegistryDialog from "@/components/RegistryDialog";
import { getPreviousWeekDates, getNextWeekDates, getWeekStartDate } from "@/utils/pcp";
import { useToast } from "@/hooks/use-toast";
import { useTaskManager } from "@/hooks/useTaskManager";
import MainHeader from "@/components/MainHeader";
import PCPSection from "@/components/PCPSection";
import TasksSection from "@/components/TasksSection";
import { motion } from "framer-motion";

interface MainPageContentProps {
  initialTab?: "dashboard" | "tasks";
}

const MainPageContent = ({ initialTab = "tasks" }: MainPageContentProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  
  // Initialize with the current week's Monday
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState(new Date());

  // Calcular data de fim da semana quando a data de início mudar
  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  // Hook personalizado para gerenciar tarefas
  const {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate
  } = useTaskManager(weekStartDate);
  
  const handleCauseSelect = (cause: string) => {
    // Se user clicks the same cause, clear the filter
    if (selectedCause === cause) {
      setSelectedCause(null);
      toast({
        title: "Filtro removido",
        description: "Mostrando todas as tarefas.",
      });
    } else {
      setSelectedCause(cause);
      toast({
        title: "Tarefas filtradas",
        description: `Mostrando tarefas com causa: ${cause}`,
      });
    }
  };
  
  const navigateToPreviousWeek = () => {
    const { start } = getPreviousWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null); // Clear filter when changing week
  };
  
  const navigateToNextWeek = () => {
    const { start } = getNextWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null); // Clear filter when changing week
  };
  
  const clearCauseFilter = () => {
    setSelectedCause(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    }
  };
  
  return (
    <motion.div 
      className="container mx-auto max-w-7xl px-4 py-6 bg-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header com título e botões */}
      <motion.div variants={itemVariants}>
        <MainHeader 
          onNewTaskClick={() => setIsFormOpen(true)}
          onRegistryClick={() => setIsRegistryOpen(true)}
        />
      </motion.div>
      
      {/* Week Navigation */}
      <motion.div variants={itemVariants}>
        <WeekNavigation
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          onPreviousWeek={navigateToPreviousWeek}
          onNextWeek={navigateToNextWeek}
        />
      </motion.div>
      
      {/* PCP Section com gráficos e filtro ativo */}
      <motion.div variants={itemVariants}>
        <PCPSection 
          pcpData={pcpData}
          weeklyPCPData={weeklyPCPData}
          tasks={tasks}
          selectedCause={selectedCause}
          onCauseSelect={handleCauseSelect}
          onClearFilter={clearCauseFilter}
        />
      </motion.div>
      
      {/* Tasks Section com lista de tarefas */}
      <motion.div variants={itemVariants}>
        <TasksSection 
          tasks={tasks}
          isLoading={isLoading}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskDuplicate={handleTaskDuplicate}
          selectedCause={selectedCause}
        />
      </motion.div>
      
      {/* Dialogs */}
      <TaskForm 
        onTaskCreate={handleTaskCreate} 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        currentWeekStartDate={weekStartDate}
      />

      <RegistryDialog 
        isOpen={isRegistryOpen} 
        onOpenChange={setIsRegistryOpen} 
      />
    </motion.div>
  );
};

export default MainPageContent;
