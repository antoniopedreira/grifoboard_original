import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2 } from "lucide-react";

const MainPageContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "sector" | "executor" | "discipline">("none");

  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState(new Date());

  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  const {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate,
    handleCopyToNextWeek,
  } = useTaskManager(weekStartDate);

  const handleCauseSelect = (cause: string) => {
    if (selectedCause === cause) {
      setSelectedCause(null);
    } else {
      setSelectedCause(cause);
    }
  };

  const navigateToPreviousWeek = () => {
    const { start } = getPreviousWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null);
  };

  const navigateToNextWeek = () => {
    const { start } = getNextWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null);
  };

  return (
    <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 py-6 min-h-screen pb-24 space-y-8">
      {/* 1. Header Principal */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <MainHeader
          onNewTaskClick={() => setIsFormOpen(true)}
          onRegistryClick={() => setIsRegistryOpen(true)}
          onChecklistClick={() => navigate("/checklist")}
        />
      </motion.div>

      {/* 2. Navegação de Semana (Full Width e Destacado) */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-full"
      >
        <WeekNavigation
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
          onPreviousWeek={navigateToPreviousWeek}
          onNextWeek={navigateToNextWeek}
        />
      </motion.div>

      {/* 3. Indicadores Visuais (HUD) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full"
      >
        <PCPSection
          pcpData={pcpData}
          weeklyPCPData={weeklyPCPData}
          tasks={tasks}
          selectedCause={selectedCause}
          onCauseSelect={handleCauseSelect}
          onClearFilter={() => setSelectedCause(null)}
        />
      </motion.div>

      {/* 4. Lista de Tarefas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-secondary animate-spin" />
            <p className="text-muted-foreground font-medium">Carregando planejamento...</p>
          </div>
        ) : (
          <TasksSection
            tasks={tasks}
            isLoading={isLoading}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskDuplicate={handleTaskDuplicate}
            onCopyToNextWeek={handleCopyToNextWeek}
            selectedCause={selectedCause}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}
      </motion.div>

      <TaskForm
        onTaskCreate={handleTaskCreate}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        currentWeekStartDate={weekStartDate}
      />

      <RegistryDialog isOpen={isRegistryOpen} onOpenChange={setIsRegistryOpen} />
    </div>
  );
};

export default MainPageContent;
