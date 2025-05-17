
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceTrendChartProps {
  weeklyPCPData: WeeklyPCPData[];
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ weeklyPCPData }) => {
  // Transform data safely for the chart
  const chartData = weeklyPCPData.map((item) => {
    // Check if date is valid before formatting
    let dateStr = "Semana";
    
    // Handle string dates (from Supabase)
    if (typeof item.date === 'string') {
      try {
        dateStr = format(parseISO(item.date), "dd/MM", { locale: ptBR });
      } catch (e) {
        dateStr = item.date.substring(0, 10); // Fallback to raw string
      }
    }
    // Handle Date objects
    else if (item.date instanceof Date && !isNaN(item.date.getTime())) {
      dateStr = format(item.date, "dd/MM", { locale: ptBR });
    }
    // Use week as fallback
    else if (item.week) {
      dateStr = `Sem ${item.week}`;
    }

    return {
      name: dateStr,
      value: item.percentage,
      isCurrentWeek: item.isCurrentWeek
    };
  });

  // Colors for bars
  const barColors = {
    normal: "#38bdf8", // Light blue
    current: "#0284c7"  // Dark blue for current week
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
