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
import { Loader2, LayoutList, PieChart, CalendarDays } from "lucide-react"; // Adicionado CalendarDays para a navegação
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PCPOverallCard from "@/components/chart/PCPOverallCard";
import PCPWeeklyChart from "@/components/chart/PCPWeeklyChart";
import PCPBreakdownCard from "@/components/chart/PCPBreakdownCard";
import WeeklyCausesChart from "@/components/dashboard/WeeklyCausesChart";

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
            {/* 1. Header Global */}     {" "}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
               {" "}
        <MainHeader
          onNewTaskClick={() => setIsFormOpen(true)}
          onRegistryClick={() => setIsRegistryOpen(true)}
          onChecklistClick={() => navigate("/checklist")}
        />
             {" "}
      </motion.div>
            {/* 2. Sistema de Abas */}     {" "}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                        {/* --- NOVO HEADER DE ABAS E NAVEGAÇÃO (MELHORADO) --- */}       {" "}
        <div className="sticky top-0 z-20 pt-2 pb-3 bg-slate-50/90 backdrop-blur-md shadow-sm border-b border-slate-200 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* 2.1 Navegação Semanal (Sempre à esquerda/topo) */}
            <div
              className={cn(
                "transition-opacity duration-300 w-full sm:w-auto",
                activeTab === "analytics" ? "opacity-50 pointer-events-none" : "opacity-100",
              )}
            >
              <WeekNavigation
                weekStartDate={weekStartDate}
                weekEndDate={weekEndDate}
                onPreviousWeek={navigateToPreviousWeek}
                onNextWeek={navigateToNextWeek}
              />
            </div>

            {/* 2.2 Abas (Centralizadas na Barra) */}
            <TabsList className="bg-white p-1 border border-slate-200 shadow-lg">
              <TabsTrigger
                value="planning"
                className="gap-2 font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md px-4 py-1.5"
              >
                <LayoutList className="h-4 w-4" />
                Planejamento & Execução
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md px-4 py-1.5"
              >
                <PieChart className="h-4 w-4" />
                Indicadores & Inteligência
              </TabsTrigger>
            </TabsList>

            {/* 2.3 Espaço Vazio para Alinhamento ou Adicionar Ação Global */}
            <div className="w-full sm:w-auto sm:opacity-0 sm:pointer-events-none">
              {/* Placeholder para manter o justify-between simétrico */}
            </div>
          </div>
        </div>
                {/* --- FIM DO NOVO HEADER --- */}        {/* === ABA 1: PLANEJAMENTO (OPERACIONAL) === */}       {" "}
        <TabsContent value="planning" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
                   {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
                       {" "}
            <PCPSection
              pcpData={pcpData}
              weeklyPCPData={weeklyPCPData}
              tasks={tasks}
              selectedCause={selectedCause}
              onCauseSelect={handleCauseSelect}
              onClearFilter={() => setSelectedCause(null)}
            />
                     {" "}
          </motion.div>
                   {" "}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                       {" "}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 text-secondary animate-spin" />               {" "}
                <p className="text-muted-foreground font-medium">Carregando planejamento...</p>             {" "}
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
                     {" "}
          </motion.div>
                 {" "}
        </TabsContent>
                {/* === ABA 2: INDICADORES (ESTRATÉGICO - DADOS GLOBAIS) === */}       {" "}
        <TabsContent value="analytics" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
                   {" "}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gráfico de Evolução Semanal */}           {" "}
            <motion.div
              className="lg:col-span-2 h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
                           {" "}
              <Card className="bg-white h-full border-border/60 shadow-sm hover:shadow-xl transition-all duration-300">
                               {" "}
                <CardHeader>
                                    <CardTitle className="text-primary font-heading">Evolução do PCP</CardTitle>       
                            <CardDescription>Histórico completo de todas as semanas do projeto</CardDescription>       
                         {" "}
                </CardHeader>
                               {" "}
                <CardContent>
                                    <PCPWeeklyChart barColor="#112232" />               {" "}
                </CardContent>
                             {" "}
              </Card>
                         {" "}
            </motion.div>
                       {" "}
            <div className="space-y-6">
                           {" "}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                               {" "}
                <PCPOverallCard
                  data={pcpData?.overall || { completedTasks: 0, totalTasks: 0, percentage: 0 }}
                  className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-all duration-300"
                />
                             {" "}
              </motion.div>
                           {" "}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                               {" "}
                <WeeklyCausesChart
                  tasks={tasks}
                  weekStartDate={weekStartDate}
                  className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-all duration-300"
                />
                             {" "}
              </motion.div>
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Detalhamento por Setor */}         {" "}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                       {" "}
            <Card className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-all duration-300">
                           {" "}
              <CardHeader>
                                <CardTitle className="text-primary font-heading">Detalhamento por Setor</CardTitle>     
                       {" "}
              </CardHeader>
                           {" "}
              <CardContent>
                                <PCPBreakdownCard title="" data={pcpData?.bySector || {}} />             {" "}
              </CardContent>
                         {" "}
            </Card>
                     {" "}
          </motion.div>
                 {" "}
        </TabsContent>
             {" "}
      </Tabs>
           {" "}
      <TaskForm
        onTaskCreate={handleTaskCreate}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        currentWeekStartDate={weekStartDate}
      />
            <RegistryDialog isOpen={isRegistryOpen} onOpenChange={setIsRegistryOpen} />   {" "}
    </div>
  );
};

export default MainPageContent;
