
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { WeeklyPCPData } from "@/types";
import { ChartContainer } from "@/components/ui/chart";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TasksProgressChartProps {
  weeklyPCPData: WeeklyPCPData[];
}

const TasksProgressChart = ({ weeklyPCPData }: TasksProgressChartProps) => {
  // Format data for the chart with proper date formatting and validation
  const chartData = weeklyPCPData.map(week => {
    // Ensure week.date is a valid Date object
    const weekStartDate = week.date instanceof Date ? week.date : new Date(week.date);
    
    // Validate date before formatting
    if (!isValid(weekStartDate)) {
      console.warn("Invalid date detected in TasksProgressChart:", week.date);
      // Use current date as fallback
      const fallbackDate = new Date();
      return {
        ...week,
        name: `Invalid-${week.week}`,
        weekLabel: `Semana ${week.week}`,
      };
    }
    
    return {
      ...week,
      name: format(weekStartDate, "dd/MM", { locale: ptBR }),
      weekLabel: `Semana ${format(weekStartDate, "dd/MM", { locale: ptBR })}`,
    };
  });

  return (
    <ChartContainer 
      config={{
        "previsto": { color: "#3b82f6" },
        "executado": { color: "#22c55e" }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="weekLabel" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, ""]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend 
            formatter={(value) => {
              if (value === "previsto") return "Previsto";
              if (value === "executado") return "Executado";
              return value;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="previsto" 
            name="previsto"
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="executado" 
            name="executado"
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TasksProgressChart;
