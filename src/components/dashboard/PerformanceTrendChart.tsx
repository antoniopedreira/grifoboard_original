
import React from "react";
import { WeeklyPCPData } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceTrendChartProps {
  weeklyPCPData: WeeklyPCPData[];
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ weeklyPCPData }) => {
  // Transforme os dados para o formato esperado pelo gráfico
  const chartData = weeklyPCPData.map((item) => ({
    name: format(item.date, "dd/MM", { locale: ptBR }), // Formato dia/mês
    value: item.percentage,
    isCurrentWeek: item.isCurrentWeek
  }));

  // Cores para barras normais e barras destacadas (semana atual)
  const barColors = {
    normal: "#38bdf8", // Azul claro
    current: "#0284c7"  // Azul escuro para a semana atual
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={chartData} 
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'PCP']}
          labelFormatter={(name) => `Semana ${name}`}
        />
        <Bar 
          dataKey="value" 
          name="PCP Semanal" 
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isCurrentWeek ? barColors.current : barColors.normal} 
              stroke={entry.isCurrentWeek ? "#0369a1" : ""}
              strokeWidth={entry.isCurrentWeek ? 1 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceTrendChart;
