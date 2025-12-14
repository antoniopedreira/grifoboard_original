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
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client"; // Importação direta para Analytics

// --- SUB-COMPONENTES DE ANALYTICS (GLOBAL) ---

// 1. Gráfico de Evolução do PCP (Estilo Barra Escura - Igual Dashboard)
const WeeklyHistoryChart = ({ tasks }: { tasks: any[] }) => {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    // Agrupar tarefas por semana (Data de Início)
    const weeksMap = new Map();

    tasks.forEach((t) => {
      // Normaliza a data para o início da semana (segunda-feira)
      const date = new Date(t.weekStartDate);
      const weekStartStr = format(date, "yyyy-MM-dd");

      if (!weeksMap.has(weekStartStr)) {
        weeksMap.set(weekStartStr, { total: 0, completed: 0, date: date });
      }

      const current = weeksMap.get(weekStartStr);
      current.total++;
      if (t.isFullyCompleted) current.completed++;
    });

    // Converter para array e ordenar
    return Array.from(weeksMap.entries())
      .map(([key, val]) => ({
        date: format(addDays(val.date, 1), "dd/MM", { locale: ptBR }), // Ajuste visual de dia
        fullDate: val.date,
        pcp: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [tasks]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm">Sem histórico suficiente para exibir gráficos.</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={50}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
          <YAxis hide domain={[0, 100]} />
          <RechartsTooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            formatter={(value: number) => [`${value}%`, "PCP"]}
          />
          <Bar dataKey="pcp" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#1e293b" /> // Cor escura (Slate 800) igual imagem
            ))}
            <LabelList
              dataKey="pcp"
              position="top"
              formatter={(val: number) => `${val}%`}
              style={{ fill: "#1e293b", fontWeight: "bold", fontSize: "12px" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Ranking de Performance Global (Média de todas as semanas)
const GlobalRanking = ({
  tasks,
  type,
  title,
  icon: Icon,
}: {
  tasks: any[];
  type: "team" | "sector" | "discipline";
  title: string;
  icon: any;
}) => {
  const data = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const key = t[type] || "Não Definido";
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
        completed: d.completed,
      }))
      .filter((i) => i.count > 0)
      .sort((a, b) => b.percentage - a.percentage); // Ordenar por % de sucesso
  }, [tasks, type]);

  if (data.length === 0)
    return <div className="p-4 text-center text-sm text-muted-foreground">Sem dados para análise.</div>;

  return (
    <Card className="border-border/60 shadow-sm flex flex-col h-full">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
        <CardTitle className="text-base font-heading text-primary flex items-center gap-2">
          <Icon className="h-4 w-4 text-secondary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">Média acumulada de todas as semanas.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  {index < 3 && type === "team" && (
                    <span
                      className={cn(
                        "flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold",
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-slate-100 text-slate-600"
                            : "bg-orange-100 text-orange-700",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-700 uppercase truncate max-w-[140px]" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold",
                    item.percentage >= 80 ? "text-green-600" : item.percentage < 50 ? "text-red-500" : "text-slate-600",
                  )}
                >
                  {item.percentage}%
                </span>
              </div>
              <Progress
                value={item.percentage}
                className={cn("h-2 bg-slate-100")}
                indicatorClassName={cn(
                  item.percentage >= 80
                    ? "bg-green-500"
                    : item.percentage >= 50
                      ? "bg-blue-500"
                      : item.percentage >= 30
                        ? "bg-yellow-500"
                        : "bg-red-500",
                )}
              />
              <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
                <span>
                  {item.completed}/{item.count} tarefas
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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

  // Estado para Analytics Global
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Estados de Semana (Para a aba de Planejamento)
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState(new Date());

  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  // Hook original (traz dados apenas da semana selecionada)
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

  // --- NOVO: Fetch de DADOS GLOBAIS para Analytics ---
  useEffect(() => {
    if (activeTab === "analytics") {
      const fetchAllTasks = async () => {
        setIsLoadingAnalytics(true);
        try {
          // Busca TODAS as tarefas sem filtro de semana
          const { data, error } = await supabase
            .from("tarefas")
            .select("*")
            .order("weekStartDate", { ascending: true });

          if (error) throw error;
          if (data) setAllTasks(data);
        } catch (error) {
          console.error("Erro ao carregar analytics:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar o histórico completo.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingAnalytics(false);
        }
      };

      fetchAllTasks();
    }
  }, [activeTab]); // Só roda quando troca para a aba Analytics

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

      {/* 2. Sistema de Abas */}
      <Tabs defaultValue="planning" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        {/* Header das Abas */}
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

          {/* Navegação Temporal (Só aparece na aba de Planejamento ou se quiser filtrar o Dashboard também, mas por padrão Dashboard é global) */}
          <div
            className={cn(
              "w-full sm:w-auto transition-opacity duration-300",
              activeTab === "analytics" ? "opacity-50 pointer-events-none grayscale" : "opacity-100",
            )}
          >
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

        {/* === ABA 2: INDICADORES (ESTRATÉGICO - DADOS GLOBAIS) === */}
        <TabsContent value="analytics" className="space-y-6 outline-none animate-in fade-in-50 duration-300">
          {isLoadingAnalytics ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Linha 1: Histórico de Evolução */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-heading text-primary flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-secondary" />
                        Evolução do PCP
                      </CardTitle>
                      <CardDescription>Histórico completo de todas as semanas do projeto</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <WeeklyHistoryChart tasks={allTasks} />
                </CardContent>
              </Card>

              {/* Linha 2: Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlobalRanking tasks={allTasks} type="team" title="Ranking de Executantes" icon={Award} />
                <GlobalRanking tasks={allTasks} type="sector" title="PCP por Setor" icon={Layers} />
                <GlobalRanking tasks={allTasks} type="discipline" title="PCP por Disciplina" icon={AlertCircle} />
              </div>
            </>
          )}
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
