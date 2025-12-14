import React, { useState, useEffect } from "react";
import { Users, Trophy, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ExecutorRankingChartProps {
  className?: string;
}

interface ExecutorData {
  executante: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

const ExecutorRankingChart: React.FC<ExecutorRankingChartProps> = ({ className }) => {
  const [executorData, setExecutorData] = useState<ExecutorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();

  useEffect(() => {
    fetchExecutorData();
  }, [userSession?.obraAtiva?.id]);

  const fetchExecutorData = async () => {
    const obraId = userSession?.obraAtiva?.id;
    if (!obraId) {
      setIsLoading(false);
      return;
    }

    try {
      // Get current week start (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() + diff);
      currentWeekStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('tarefas')
        .select('executante, seg, ter, qua, qui, sex, sab, dom, semana')
        .eq('obra_id', obraId)
        .lte('semana', currentWeekStart.toISOString().split('T')[0]);

      if (error) {
        console.error("Erro ao buscar dados de executantes:", error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const executorStats: Record<string, { total: number; completed: number }> = {};

        data.forEach(task => {
          const executor = task.executante || 'Não definido';
          if (!executorStats[executor]) {
            executorStats[executor] = { total: 0, completed: 0 };
          }

          const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;
          days.forEach(day => {
            const dayValue = task[day];
            // Check for both short codes (P/C) and full text (Planejada/Executada)
            if (dayValue === 'P' || dayValue === 'Planejada') {
              executorStats[executor].total++;
            } else if (dayValue === 'C' || dayValue === 'Executada') {
              executorStats[executor].total++;
              executorStats[executor].completed++;
            }
          });
        });

        const processedData: ExecutorData[] = Object.entries(executorStats)
          .filter(([_, stats]) => stats.total > 0)
          .map(([executante, stats]) => ({
            executante,
            totalTasks: stats.total,
            completedTasks: stats.completed,
            percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
          }))
          .sort((a, b) => b.percentage - a.percentage);

        setExecutorData(processedData);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao calcular ranking:", err);
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-slate-400" />;
    if (index === 2) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{index + 1}</span>;
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 85) return "text-green-600 bg-green-500";
    if (pct >= 70) return "text-amber-600 bg-amber-500";
    return "text-red-600 bg-red-500";
  };

  return (
    <div className={cn("h-full p-6 rounded-2xl bg-white border border-border/60", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <Users className="h-5 w-5 text-secondary" />
          Ranking por Executante
        </h3>
        <Badge variant="outline" className="animate-fade-in">
          {executorData.length} executantes
        </Badge>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground animate-fade-in">
            <p className="text-sm">Carregando...</p>
          </div>
        ) : executorData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground animate-fade-in">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum executante encontrado</p>
          </div>
        ) : (
          executorData.map((item, index) => {
            const colorClasses = getPercentageColor(item.percentage);
            return (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border border-border bg-background transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-sm animate-fade-in",
                  index === 0 && "border-yellow-300 bg-yellow-50/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-primary truncate uppercase">
                      {item.executante}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.completedTasks} de {item.totalTasks} atividades
                    </div>
                  </div>
                  <div className={cn("text-right font-bold text-sm", colorClasses.split(' ')[0])}>
                    {Math.round(item.percentage)}%
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-9">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", colorClasses.split(' ')[1])}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(ExecutorRankingChart);
