
import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Task } from "@/types";
import { WeeklyPCPData } from "@/types";
import { ChartContainer } from "@/components/ui/chart";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TasksProgressChartProps {
  weeklyPCPData: WeeklyPCPData[];
}

const TasksProgressChart: React.FC<TasksProgressChartProps> = ({ weeklyPCPData }) => {
  // Format data for the chart
  const chartData = useMemo(() => {
    return weeklyPCPData.map(week => ({
      name: format(new Date(week.date), "dd/MM", { locale: ptBR }),
      pcp: week.percentage,
      meta: 80, // Meta fixa de 80% para demonstração
      isCurrentWeek: week.isCurrentWeek
    }));
  }, [weeklyPCPData]);

  // Calculate current performance vs target
  const currentWeekData = weeklyPCPData.find(w => w.isCurrentWeek);
  const performance = currentWeekData ? currentWeekData.percentage : 0;
  const target = 80; // Meta fixa
  const difference = performance - target;

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-2xl font-bold">{performance}%</span>
        <p className="text-sm text-muted-foreground">
          {difference >= 0 
            ? `${difference}% acima da meta` 
            : `${Math.abs(difference)}% abaixo da meta`}
        </p>
      </div>
      
      <ChartContainer 
        config={{
          "pcp": { color: "#8b5cf6" },
          "meta": { color: "#f97316" }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value) => [`${value}%`, ""]}
              labelFormatter={(label) => `Semana: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="pcp"
              stroke="#8b5cf6"
              name="PCP"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="meta"
              stroke="#f97316"
              name="Meta"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default TasksProgressChart;
