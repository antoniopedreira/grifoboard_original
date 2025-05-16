
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface TasksByDisciplineChartProps {
  tasks: Task[];
}

const TasksByDisciplineChart: React.FC<TasksByDisciplineChartProps> = ({ tasks }) => {
  // Count tasks by discipline
  const disciplineData = useMemo(() => {
    const disciplineCounts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const discipline = task.discipline || "Não definida";
      disciplineCounts[discipline] = (disciplineCounts[discipline] || 0) + 1;
    });
    
    // Convert to array and sort by count (descending)
    return Object.entries(disciplineCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  // Colors for disciplines
  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#a3e635", "#06b6d4", "#14b8a6"];
  
  // Generate config for chart container
  const chartConfig = useMemo(() => {
    const config: any = {};
    disciplineData.forEach((item, index) => {
      config[item.name] = { color: COLORS[index % COLORS.length] };
    });
    return config;
  }, [disciplineData]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-2xl font-bold">{disciplineData.length}</span>
        <p className="text-sm text-muted-foreground">Disciplinas</p>
      </div>
      
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={disciplineData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {disciplineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tarefas`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default TasksByDisciplineChart;
