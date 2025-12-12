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
    <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 py-6 min-h-screen pb-24">
      {/* Header com ações principais */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <MainHeader
          onNewTaskClick={() => setIsFormOpen(true)}
          onRegistryClick={() => setIsRegistryOpen(true)}
          onChecklistClick={() => navigate("/checklist")}
        />
      </motion.div>

      {/* Navegação e Indicadores (HUD) */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {/* Coluna Esquerda: Navegação Temporal */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <WeekNavigation
            weekStartDate={weekStartDate}
            weekEndDate={weekEndDate}
            onPreviousWeek={navigateToPreviousWeek}
            onNextWeek={navigateToNextWeek}
          />

          {/* Card de Resumo Rápido da Semana */}
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-lg font-heading font-semibold mb-1 relative z-10">Resumo Semanal</h3>
            <p className="text-primary-foreground/70 text-sm mb-4 relative z-10">
              {tasks.length} atividades planejadas
            </p>
            <div className="flex gap-4 relative z-10">
              <div className="flex-1 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{Math.round(pcpData?.overall?.percentage || 0)}%</span>
                <span className="text-xs text-primary-foreground/60">PCP Atual</span>
              </div>
              <div className="flex-1 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tasks.filter((t) => t.isFullyCompleted).length}</span>
                <span className="text-xs text-primary-foreground/60">Concluídas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Gráficos e Filtros Visuais */}
        <div className="xl:col-span-8">
          <PCPSection
            pcpData={pcpData}
            weeklyPCPData={weeklyPCPData}
            tasks={tasks}
            selectedCause={selectedCause}
            onCauseSelect={handleCauseSelect}
            onClearFilter={() => setSelectedCause(null)}
          />
        </div>
      </motion.div>

      {/* Área de Tarefas */}
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
