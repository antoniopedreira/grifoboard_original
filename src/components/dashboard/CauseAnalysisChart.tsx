
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface CauseAnalysisChartProps {
  tasks: Task[];
}

const CauseAnalysisChart: React.FC<CauseAnalysisChartProps> = ({ tasks }) => {
  // Count tasks by failure cause
  const causeData = useMemo(() => {
    const causeCounts: Record<string, number> = {};
    
    // Only include non-completed tasks with causes
    tasks.filter(task => !task.isFullyCompleted && task.causeIfNotDone)
      .forEach(task => {
        const cause = task.causeIfNotDone || "Não especificada";
        causeCounts[cause] = (causeCounts[cause] || 0) + 1;
      });
    
    // Convert to array and sort by count
    return Object.entries(causeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);

  // Colors for causes
  const COLORS = ["#f43f5e", "#f97316", "#eab308", "#a3e635", "#06b6d4"];
  
  // Generate config for chart
  const chartConfig = useMemo(() => {
    const config: any = {};
    causeData.forEach((item, index) => {
      config[item.name] = { color: COLORS[index % COLORS.length] };
    });
    return config;
  }, [causeData]);

  // Calculate totals for display
  const totalNonCompleted = tasks.filter(t => !t.isFullyCompleted).length;
  const totalWithCause = causeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-2xl font-bold">{totalWithCause}</span>
        <p className="text-sm text-muted-foreground">Tarefas com causas especificadas</p>
      </div>
      
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={causeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => (percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : '')}
            >
              {causeData.map((entry, index) => (
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

export default CauseAnalysisChart;
