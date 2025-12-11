import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { format, isValid, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PCPWeeklyChartProps {
  weeklyData?: any[];
  barColor?: string; // Nova prop opcional
}

const PCPWeeklyChart: React.FC<PCPWeeklyChartProps> = ({ weeklyData, barColor = "#021C2F" }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;

  // Se weeklyData for fornecido via props, use-o (prioridade)
  useEffect(() => {
    if (weeklyData && weeklyData.length > 0) {
      const formatted = weeklyData.map((d) => ({
        name: d.week,
        value: d.percentage,
        isCurrentWeek: d.isCurrentWeek,
      }));
      setChartData(formatted);
      setIsLoading(false);
    } else {
      // Caso contrário, busca do Supabase (fallback legado)
      fetchResumoExecucaoData();
    }
  }, [weeklyData, obraId]);

  const fetchResumoExecucaoData = async () => {
    if (!obraId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("resumo_execucao_semanal")
        .select("semana, percentual_concluido")
        .eq("obra_id", obraId)
        .order("semana", { ascending: true });

      if (error) {
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((item, index) => {
          let date = null;
          if (item.semana) {
            const parsedDate = typeof item.semana === "string" ? parseISO(item.semana) : new Date(item.semana);
            if (isValid(parsedDate)) date = startOfWeek(parsedDate, { weekStartsOn: 1 });
          }
          const formattedDate = date && isValid(date) ? format(date, "dd/MM", { locale: ptBR }) : `Semana ${index + 1}`;
          return {
            name: formattedDate,
            value: (item.percentual_concluido || 0) * 100,
            isCurrentWeek: index === data.length - 1,
          };
        });
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center h-64 items-center text-gray-500">Carregando...</div>;
  if (chartData.length === 0)
    return <div className="flex justify-center h-64 items-center text-gray-500">Sem dados</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="value" name="Progresso" radius={[4, 4, 0, 0]} fill={barColor}>
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: number) => `${Math.round(v)}%`}
            style={{ fontSize: 11, fill: "#64748b" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PCPWeeklyChart;
