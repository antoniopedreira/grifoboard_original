import { useState, useEffect, useMemo } from "react";
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
import { Loader2, LayoutList, PieChart, TrendingUp, Award, Layers, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// CORREÇÃO: Importando o 'cn' aqui
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- SUB-COMPONENTES DE ANALYTICS ---

// 1. Gráfico de Histórico Semanal
const WeeklyHistoryChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm">Sem histórico suficiente para exibir gráficos.</p>
      </div>
    );
  }

  // Formatar dados para o gráfico
  const chartData = data
    .filter((d) => d.weekStartDate && !isNaN(new Date(d.weekStartDate).getTime()))
    .map((d) => ({
      name: `Sem ${d.weekNumber || '?'}`,
      date: format(new Date(d.weekStartDate), "dd/MM", { locale: ptBR }),
      pcp: d.percentage || 0,
      fullDate: d.weekStartDate,
    }))
    .reverse();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPcp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} unit="%" />
          <RechartsTooltip
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            cursor={{ stroke: "#0ea5e9", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="pcp"
            stroke="#0ea5e9"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPcp)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Ranking de Performance (Executantes)
const ExecutorRanking = ({ tasks }: { tasks: any[] }) => {
  // Agrupar e calcular performance
  const stats = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const name = t.team || "Sem Equipe";
      if (!map.has(name)) map.set(name, { total: 0, completed: 0 });
      const current = map.get(name);
      current.total++;
      if (t.isFullyCompleted) current.completed++;
    });

    return Array.from(map.entries())
      .map(([name, data]) => ({
        name,
        percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        ...data,
      }))
      .sort((a, b) => b.percentage - a.percentage); // Ordenar por melhor performance
  }, [tasks]);

  if (stats.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhuma tarefa registrada nesta semana.</p>;

  return (
    <div className="space-y-5">
      {stats.map((stat, index) => (
        <div key={stat.name} className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                  index === 0
                    ? "bg-yellow-100 text-yellow-700"
                    : index === 1
                      ? "bg-slate-100 text-slate-600"
                      : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-transparent text-slate-400",
                )}
              >
                {index + 1}
              </span>
              <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{stat.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-600">{stat.percentage}%</span>
          </div>
          <Progress
            value={stat.percentage}
            className={cn(
              "h-2",
              stat.percentage >= 80 ? "bg-slate-100" : stat.percentage >= 50 ? "bg-slate-100" : "bg-slate-100",
            )}
          >
            <div
              className={cn(
                "h-full transition-all rounded-full",
                stat.percentage >= 100
                  ? "bg-green-500"
                  : stat.percentage >= 70
                    ? "bg-blue-500"
                    : stat.percentage >= 40
                      ? "bg-yellow-500"
                      : "bg-red-500",
              )}
              style={{ width: `${stat.percentage}%` }}
            />
          </Progress>
          <div className="flex justify-between text-[10px] text-slate-400 px-1">
            <span>{stat.completed} concluídas</span>
            <span>{stat.total} total</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Breakdown por Setor ou Disciplina
const BreakdownChart = ({ tasks, type }: { tasks: any[]; type: "sector" | "discipline" }) => {
  const data = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = t[type] || "N/A";
      if (!map.has(key)) map.set(key, { total: 0, completed: 0 });
      const current = map.get(key);
      current.total++;
      if (t.isFullyCompleted) current.completed++;
    });

    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        percentage: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        count: d.total,
      }))
      .sort((a, b) => b.count - a.count); // Ordenar por volume de tarefas
  }, [tasks, type]);

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.map((item) => (
        <div
          key={item.name}
          className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <span
              className="text-xs font-bold text-slate-600 uppercase truncate max-w-[80%] break-words leading-tight"
              title={item.name}
            >
              {item.name}
            </span>
            <span className="text-[10px] bg-white border border-slate-200 px-1.5 rounded text-slate-500">
              {item.count}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">PCP</span>
              <span
                className={cn(
                  "font-bold",
                  item.percentage >= 80 ? "text-green-600" : item.percentage < 50 ? "text-red-500" : "text-slate-600",
                )}
              >
                {item.percentage}%
              </span>
            </div>
            <Progress value={item.percentage} className="h-1.5" />
          </div>
        </div>
      ))}
    </div>
  );
};

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

      {/* 2. Abas: Planejamento vs Inteligência */}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        {/* Header das Abas + Navegação Temporal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-2 bg-white/50 backdrop-blur-sm sticky top-0 z-20 pt-2">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger
              value="planning"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              <LayoutList className="h-4 w-4" />
              Planejamento & Execução
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              <PieChart className="h-4 w-4" />
              Indicadores & Inteligência
            </TabsTrigger>
          </TabsList>

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
        <TabsContent value="analytics" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          {/* Linha 1: Histórico de Evolução */}
          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-heading text-primary flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Histórico de Evolução PCP
                  </CardTitle>
                  <CardDescription>
                    Acompanhamento do Índice de Planejamento Cumprido (PCP) semanalmente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <WeeklyHistoryChart data={weeklyPCPData} />
            </CardContent>
          </Card>

          {/* Linha 2: Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ranking de Equipes */}
            <Card className="border-border/60 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                  <Award className="h-4 w-4 text-secondary" />
                  Ranking de Execução
                </CardTitle>
                <CardDescription className="text-xs">Performance por equipe na semana selecionada.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <ExecutorRanking tasks={tasks} />
              </CardContent>
            </Card>

            {/* Desempenho por Setor */}
            <Card className="border-border/60 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                  <Layers className="h-4 w-4 text-secondary" />
                  Análise por Setor
                </CardTitle>
                <CardDescription className="text-xs">Aderência ao planejamento por local.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <BreakdownChart tasks={tasks} type="sector" />
              </CardContent>
            </Card>

            {/* Desempenho por Disciplina */}
            <Card className="border-border/60 shadow-sm flex flex-col">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-secondary" />
                  Análise por Disciplina
                </CardTitle>
                <CardDescription className="text-xs">Aderência por tipo de serviço.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <BreakdownChart tasks={tasks} type="discipline" />
              </CardContent>
            </Card>
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
