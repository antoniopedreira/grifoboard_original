
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface WeekStatusChartProps {
  tasks: Task[];
}

const WeekStatusChart: React.FC<WeekStatusChartProps> = ({ tasks }) => {
  // Calcular os dados para o gráfico de pizza
  const chartData = useMemo(() => {
    const completed = tasks.filter(task => task.isFullyCompleted).length;
    const notDone = tasks.filter(task => 
      !task.isFullyCompleted && 
      task.dailyStatus.some(s => s.status === 'not_done')
    ).length;
    const planned = tasks.length - completed - notDone;
    
    return [
      { name: "Concluídas", value: completed, color: "#22C55E" },
      { name: "Não Feitas", value: notDone, color: "#EF4444" },
      { name: "Planejadas", value: planned, color: "#3B82F6" }
    ].filter(item => item.value > 0); // Remove zeros para não exibir fatias vazias
  }, [tasks]);

  // Se não houver dados, exiba uma mensagem
  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex justify-center items-center">
        <p className="text-muted-foreground">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: "Status das Tarefas"
        }
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tarefas`, 'Quantidade']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default WeekStatusChart;
