import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { format, isValid, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PCPWeeklyChartProps {
  barColor?: string;
}

const PCPWeeklyChart: React.FC<PCPWeeklyChartProps> = ({ barColor = "#021C2F" }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;

  useEffect(() => {
    fetchResumoExecucaoData();
  }, [obraId]);

  const fetchResumoExecucaoData = async () => {
    if (!obraId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Busca TODAS as semanas registradas no banco de dados
      const { data, error } = await supabase
        .from("resumo_execucao_semanal")
        .select("semana, percentual_concluido")
        .eq("obra_id", obraId)
        .order("semana", { ascending: true });

      if (error) {
        console.error("Erro ao buscar histórico PCP:", error);
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((item, index) => {
          let formattedLabel = `Semana ${index + 1}`;

          // Tenta formatar a data se ela existir
          if (item.semana) {
            const parsedDate = typeof item.semana === "string" ? parseISO(item.semana) : new Date(item.semana);
            if (isValid(parsedDate)) {
              // Pega o início da semana para consistência
              const date = startOfWeek(parsedDate, { weekStartsOn: 1 });
              formattedLabel = format(date, "dd/MM", { locale: ptBR });
            }
          }

          return {
            name: formattedLabel,
            fullDate: item.semana,
            value: (item.percentual_concluido || 0) * 100,
          };
        });

        setChartData(formattedData);
      } else {
        setChartData([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Erro interno no gráfico PCP:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 animate-pulse">Carregando histórico...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>Sem dados históricos disponíveis</p>
        <span className="text-xs mt-1">Os dados aparecerão conforme as semanas forem concluídas.</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
          interval={0} // Tenta mostrar todas as semanas
        />
        <YAxis
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Bar dataKey="value" name="Progresso" radius={[4, 4, 0, 0]} fill={barColor} animationDuration={1500}>
          <LabelList
            dataKey="value"
            position="top"
            formatter={(value: number) => `${Math.round(value)}%`}
            style={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PCPWeeklyChart;
