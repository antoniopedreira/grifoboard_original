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
import { Loader2, LayoutList, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MainPageContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"none" | "sector" | "executor" | "discipline">("none");
  const [activeTab, setActiveTab] = useState("planning");

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
    <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 py-6 min-h-screen pb-24 space-y-6">
      {/* 1. Header Global */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <MainHeader
          onNewTaskClick={() => setIsFormOpen(true)}
          onRegistryClick={() => setIsRegistryOpen(true)}
          onChecklistClick={() => navigate("/checklist")}
        />
      </motion.div>

      {/* 2. Sistema de Abas (Merge de Dashboard e Tarefas) */}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        {/* Navegação entre Modos */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-2">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger
              value="planning"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <LayoutList className="h-4 w-4" />
              Planejamento & Execução
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <PieChart className="h-4 w-4" />
              Indicadores (Dashboard)
            </TabsTrigger>
          </TabsList>

          {/* O seletor de semana fica visível em ambas as abas, pois o dashboard também é temporal */}
          <div className="w-full sm:w-auto">
            <WeekNavigation
              weekStartDate={weekStartDate}
              weekEndDate={weekEndDate}
              onPreviousWeek={navigateToPreviousWeek}
              onNextWeek={navigateToNextWeek}
            />
          </div>
        </div>

        {/* === ABA 1: PLANEJAMENTO (OPERACIONAL) === */}
        <TabsContent value="planning" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          {/* HUD (Indicadores Rápidos) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
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

          {/* Lista de Tarefas */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
        </TabsContent>

        {/* === ABA 2: INDICADORES (ESTRATÉGICO) === */}
        <TabsContent value="analytics" className="space-y-8 outline-none animate-in fade-in-50 duration-300">
          <div className="grid gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
              <h3 className="text-lg font-heading font-semibold text-primary mb-2">Painel de Inteligência PCP</h3>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                Visualize a evolução da Curva S, aderência ao planejamento e análise profunda das causas de desvios.
                (Aqui entrarão os componentes do antigo Dashboard completo).
              </p>
            </div>

            {/* Reutilizando os componentes de gráficos de forma expandida */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exemplo: Aqui você pode colocar componentes mais detalhados de histórico */}
              <div className="h-[400px]">
                <PCPSection
                  pcpData={pcpData}
                  weeklyPCPData={weeklyPCPData}
                  tasks={tasks} // Passando todas as tarefas para análise
                  selectedCause={null}
                  onCauseSelect={() => {}}
                  onClearFilter={() => {}}
                />
              </div>
              {/* Placeholder para Curva S futura */}
              <div className="h-[400px] bg-white rounded-xl border border-border/60 shadow-sm flex items-center justify-center flex-col gap-3 text-muted-foreground">
                <PieChart className="h-10 w-10 opacity-20" />
                <span>Gráfico de Curva S (Em Desenvolvimento)</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
