
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface TopPerformersChartProps {
  tasks: Task[];
}

const TopPerformersChart: React.FC<TopPerformersChartProps> = ({ tasks }) => {
  // Calculate performance by responsible person
  const performanceData = useMemo(() => {
    const responsibleStats: Record<string, { total: number; completed: number }> = {};
    
    tasks.forEach(task => {
      if (!task.responsible) return;
      
      if (!responsibleStats[task.responsible]) {
        responsibleStats[task.responsible] = { total: 0, completed: 0 };
      }
      
      responsibleStats[task.responsible].total += 1;
      
      if (task.isFullyCompleted) {
        responsibleStats[task.responsible].completed += 1;
      }
    });
    
    // Convert to array with completion rates
    return Object.entries(responsibleStats)
      .map(([name, stats]) => ({
        name,
        rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        tasks: stats.total
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5); // Top 5
  }, [tasks]);

  return (
    <ChartContainer 
      config={{
        "rate": { color: "#8b5cf6" }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={performanceData}
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === "rate") return [`${value}%`, "Taxa de Conclusão"];
              return [value, name];
            }}
            itemSorter={() => -1}
          />
          <Bar dataKey="rate" name="Taxa de Conclusão" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TopPerformersChart;
