import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import PCPOverallCard from "@/components/chart/PCPOverallCard";
import PCPWeeklyChart from "@/components/chart/PCPWeeklyChart";
import PCPBreakdownCard from "@/components/chart/PCPBreakdownCard";
import WeeklyCausesChart from "@/components/dashboard/WeeklyCausesChart";
import { motion } from "framer-motion";
import { startOfWeek } from "date-fns";

const DashboardContent = () => {
  const { userSession } = useAuth();
  // 1. Definir data de início da semana para o hook
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    // historicalPCP removido pois não existe no hook original
  } = useTaskManager(currentWeekStart);

  if (!userSession?.obraAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-primary">Nenhuma obra selecionada</h2>
        <p className="text-muted-foreground">Selecione uma obra no menu lateral para visualizar os dados.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total de Tarefas",
      value: tasks.length,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "PCP Geral",
      value: `${Math.round(pcpData.overall.percentage)}%`,
      icon: TrendingUp,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Tarefas Pendentes",
      value: tasks.filter((t) => !t.isFullyCompleted).length,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da obra <span className="font-semibold text-primary">{userSession.obraAtiva.nome_obra}</span>
          </p>
        </div>

        <div className="flex items-center text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          Dados atualizados
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold font-heading text-primary">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2 h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border-border/60 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-primary font-heading">Evolução do PCP</CardTitle>
              <CardDescription>Acompanhamento semanal do Planejado vs Realizado</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 2. Corrigido nome da prop para weeklyData e adicionado suporte a cores */}
              <PCPWeeklyChart weeklyData={weeklyPCPData} barColor="#112232" />
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            {/* 3. Corrigido data={pcpData.overall} e adicionado suporte a className */}
            <PCPOverallCard data={pcpData.overall} className="bg-white border-border/60 shadow-sm" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            {/* 4. Adicionado weekStartDate obrigatório */}
            <WeeklyCausesChart
              tasks={tasks}
              weekStartDate={currentWeekStart}
              className="bg-white border-border/60 shadow-sm"
            />
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-white border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary font-heading">Detalhamento por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 5. Corrigido estrutura de dados para bySector */}
            <PCPBreakdownCard title="" data={pcpData.bySector} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardContent;
