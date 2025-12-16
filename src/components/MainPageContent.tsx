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



import { Loader2, LayoutList, PieChart } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";



import PCPWeeklyChart from "@/components/chart/PCPWeeklyChart";

import PCPGeneralCard from "@/components/chart/PCPGeneralCard";

import AllCausesChart from "@/components/chart/AllCausesChart";

import ExecutorRankingChart from "@/components/chart/ExecutorRankingChart";

import BreakdownWithFilter from "@/components/chart/BreakdownWithFilter";

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
      <MainHeader
        onNewTaskClick={() => setIsFormOpen(true)}
        onRegistryClick={() => setIsRegistryOpen(true)}
        onChecklistClick={() => navigate("/checklist")}
      />

      {/* 2. Sistema de Abas - Design Premium */}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        {/* Header Unificado */}
        <div className="bg-gradient-to-r from-white via-white to-slate-50/80 rounded-2xl shadow-lg border border-border/40 p-2 sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Tabs com design refinado */}
            <TabsList className="bg-slate-100/80 p-1.5 rounded-xl h-auto w-full lg:w-auto">
              <TabsTrigger
                value="planning"
                className="gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:shadow-primary/10
                  data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-white/50"
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">Planejamento & Execução</span>
                <span className="sm:hidden">Planejamento</span>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:shadow-primary/10
                  data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-white/50"
              >
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Indicadores & Inteligência</span>
                <span className="sm:hidden">Indicadores</span>
              </TabsTrigger>
            </TabsList>

            {/* Week Navigation - Sempre ativo */}
            <div className="flex items-center gap-2">
              <WeekNavigation
                weekStartDate={weekStartDate}
                weekEndDate={weekEndDate}
                onPreviousWeek={navigateToPreviousWeek}
                onNextWeek={navigateToNextWeek}
              />
            </div>
          </div>
        </div>

        {/* === ABA 1: PLANEJAMENTO (OPERACIONAL) === */}
        <TabsContent value="planning" className="space-y-6 outline-none">
          <div className="w-full">
            <PCPSection
              pcpData={pcpData}
              weeklyPCPData={weeklyPCPData}
              tasks={tasks}
              selectedCause={selectedCause}
              onCauseSelect={handleCauseSelect}
              onClearFilter={() => setSelectedCause(null)}
            />
          </div>

          {/* Mostrar loading apenas na primeira carga (sem tarefas) */}
          {isLoading && tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-secondary animate-spin" />
              <p className="text-muted-foreground font-medium">Carregando planejamento...</p>
            </div>
          ) : (
            <TasksSection
              tasks={tasks}
              isLoading={false}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskDuplicate={handleTaskDuplicate}
              onCopyToNextWeek={handleCopyToNextWeek}
              selectedCause={selectedCause}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          )}
        </TabsContent>

        {/* === ABA 2: INDICADORES (ESTRATÉGICO - DADOS GLOBAIS) === */}

        <TabsContent value="analytics" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Evolução Semanal */}
            <div className="lg:col-span-2 h-full">
              <Card className="bg-white h-full border-border/60 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-primary font-heading">Evolução do PCP</CardTitle>
                  <CardDescription>Histórico completo de todas as semanas do projeto</CardDescription>
                </CardHeader>
                <CardContent>
                  <PCPWeeklyChart barColor="#112232" />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <PCPGeneralCard
                className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-shadow duration-300"
              />
              <AllCausesChart
                className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-shadow duration-300"
              />
            </div>
          </div>

          {/* Ranking e Detalhamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExecutorRankingChart
              className="shadow-sm hover:shadow-xl transition-shadow duration-300"
            />
            <BreakdownWithFilter
              className="bg-white border-border/60 shadow-sm hover:shadow-xl transition-shadow duration-300"
            />
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
