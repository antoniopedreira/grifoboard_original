import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Tooltip, // Importado Tooltip
} from "recharts";
import { format, isValid, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PCPWeeklyChartProps {
  barColor?: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border/50 shadow-xl rounded-xl">
        <p className="text-sm font-semibold text-primary mb-1">{label}</p>
        <p className="text-sm text-secondary font-bold">{`Progresso: ${Math.round(payload[0].value)}%`}</p>
      </div>
    );
  }
  return null;
};

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
          let formattedLabel = `Semana ${index + 1}`;
          if (item.semana) {
            const parsedDate = typeof item.semana === "string" ? parseISO(item.semana) : new Date(item.semana);
            if (isValid(parsedDate)) {
              const date = startOfWeek(parsedDate, { weekStartsOn: 1 });
              formattedLabel = format(date, "dd/MM", { locale: ptBR });
            }
          }
          return {
            name: formattedLabel,
            value: (item.percentual_concluido || 0) * 100,
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

  if (isLoading)
    return <div className="flex justify-center h-64 items-center text-gray-500 animate-pulse">Carregando...</div>;
  if (chartData.length === 0)
    return <div className="flex justify-center h-64 items-center text-gray-500">Sem dados</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Bar
          dataKey="value"
          name="Progresso"
          radius={[6, 6, 0, 0]}
          fill={barColor}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: number) => `${Math.round(v)}%`}
            style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PCPWeeklyChart;
