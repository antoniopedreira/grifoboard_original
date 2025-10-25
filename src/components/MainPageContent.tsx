
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

interface MainPageContentProps {
  initialTab?: "dashboard" | "tasks";
}

const MainPageContent = ({ initialTab = "tasks" }: MainPageContentProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "sector" | "executor" | "discipline">("none");
  
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

  const handleSortChange = (newSortBy: "none" | "sector" | "executor" | "discipline") => {
    console.log("Sort change:", newSortBy);
    setSortBy(newSortBy);
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-8 py-6 bg-background">
      {/* Header com título e botões */}
      <MainHeader 
        onNewTaskClick={() => setIsFormOpen(true)}
        onRegistryClick={() => setIsRegistryOpen(true)}
      />
      
      {/* Week Navigation */}
      <WeekNavigation
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        onPreviousWeek={navigateToPreviousWeek}
        onNextWeek={navigateToNextWeek}
      />
      
      {/* PCP Section com gráficos e filtro ativo */}
      <PCPSection 
        pcpData={pcpData}
        weeklyPCPData={weeklyPCPData}
        tasks={tasks}
        selectedCause={selectedCause}
        onCauseSelect={handleCauseSelect}
        onClearFilter={clearCauseFilter}
      />
      
      {/* Tasks Section com lista de tarefas */}
      <TasksSection 
        tasks={tasks}
        isLoading={isLoading}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        onTaskDuplicate={handleTaskDuplicate}
        selectedCause={selectedCause}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />
      
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
    </div>
  );
};

export default MainPageContent;
