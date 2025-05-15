
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";
import { format, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCompletionChartProps {
  tasks: Task[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  // Processar dados para o gráfico de conclusão de tarefas por semana
  const chartData = useMemo(() => {
    // Criar um mapa de semanas com contagem de tarefas concluídas e não concluídas
    const weekMap = new Map();
    
    // Ordenar tarefas por data da semana
    const tasksWithDate = tasks.filter(task => task.weekStartDate);
    
    // Data atual e últimas 4 semanas
    const currentDate = new Date();
    const weeks = [
      { date: subWeeks(currentDate, 4), label: format(subWeeks(currentDate, 4), 'dd/MM', { locale: ptBR }) },
      { date: subWeeks(currentDate, 3), label: format(subWeeks(currentDate, 3), 'dd/MM', { locale: ptBR }) },
      { date: subWeeks(currentDate, 2), label: format(subWeeks(currentDate, 2), 'dd/MM', { locale: ptBR }) },
      { date: subWeeks(currentDate, 1), label: format(subWeeks(currentDate, 1), 'dd/MM', { locale: ptBR }) },
      { date: currentDate, label: format(currentDate, 'dd/MM', { locale: ptBR }) }
    ];
    
    // Inicializar o mapa com as semanas
    weeks.forEach(week => {
      const weekKey = format(week.date, 'yyyy-MM-dd');
      weekMap.set(weekKey, {
        week: week.label,
        completed: 0,
        notCompleted: 0,
        total: 0
      });
    });
    
    // Contar tarefas por semana
    tasksWithDate.forEach(task => {
      if (!task.weekStartDate) return;
      
      const weekKey = format(new Date(task.weekStartDate), 'yyyy-MM-dd');
      if (weekMap.has(weekKey)) {
        const weekData = weekMap.get(weekKey);
        weekData.total += 1;
        
        if (task.isFullyCompleted) {
          weekData.completed += 1;
        } else {
          weekData.notCompleted += 1;
        }
        
        weekMap.set(weekKey, weekData);
      }
    });
    
    // Converter o mapa para um array
    return Array.from(weekMap.values());
  }, [tasks]);

  return (
    <ChartContainer
      config={{
        completed: {
          label: "Concluídas",
          theme: {
            light: "#22C55E",
            dark: "#22C55E"
          }
        },
        notCompleted: {
          label: "Não Concluídas",
          theme: {
            light: "#EF4444",
            dark: "#EF4444"
          }
        }
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={20}
          barGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="week" 
            scale="point" 
            padding={{ left: 10, right: 10 }} 
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" name="Concluídas" stackId="a" fill="var(--color-completed)" />
          <Bar dataKey="notCompleted" name="Não Concluídas" stackId="a" fill="var(--color-notCompleted)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TaskCompletionChart;
