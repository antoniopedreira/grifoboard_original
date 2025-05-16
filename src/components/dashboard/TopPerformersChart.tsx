
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface TopPerformersChartProps {
  tasks: Task[];
  filterType?: 'responsaveis' | 'executantes' | 'equipes' | 'cabos';
}

const TopPerformersChart: React.FC<TopPerformersChartProps> = ({ tasks, filterType = 'responsaveis' }) => {
  // Calculate performance by the selected filter type
  const performanceData = useMemo(() => {
    // Function to get the appropriate field value based on filterType
    const getFieldValue = (task: Task): string => {
      switch (filterType) {
        case 'responsaveis':
          return task.responsible || 'Não atribuído';
        case 'executantes':
          return task.executor || 'Não atribuído';
        case 'equipes':
          return task.team || 'Sem equipe';
        case 'cabos':
          return task.leader || 'Sem cabo';
        default:
          return task.responsible || 'Não atribuído';
      }
    };
    
    const stats: Record<string, { total: number; completed: number }> = {};
    
    tasks.forEach(task => {
      const fieldValue = getFieldValue(task);
      
      if (!stats[fieldValue]) {
        stats[fieldValue] = { total: 0, completed: 0 };
      }
      
      stats[fieldValue].total += 1;
      
      if (task.isFullyCompleted) {
        stats[fieldValue].completed += 1;
      }
    });
    
    // Convert to array with completion rates
    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        tasks: data.total
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5); // Top 5
  }, [tasks, filterType]);

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
