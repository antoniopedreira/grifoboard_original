
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Task, DayOfWeek } from "@/types";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer } from "@/components/ui/chart";

interface DailyTasksChartProps {
  tasks: Task[];
  weekStartDate: Date;
}

const DailyTasksChart: React.FC<DailyTasksChartProps> = ({ tasks, weekStartDate }) => {
  // Map days of week to Portuguese names and date strings
  const daysMapping: Record<DayOfWeek, { index: number, name: string }> = {
    'mon': { index: 0, name: 'Segunda' },
    'tue': { index: 1, name: 'Terça' },
    'wed': { index: 2, name: 'Quarta' },
    'thu': { index: 3, name: 'Quinta' },
    'fri': { index: 4, name: 'Sexta' },
    'sat': { index: 5, name: 'Sábado' },
    'sun': { index: 6, name: 'Domingo' }
  };

  // Create data for each day of the week
  const dailyData = useMemo(() => {
    // Initialize data for each day
    const data = Object.values(daysMapping).map(({ index, name }) => {
      const date = addDays(new Date(weekStartDate), index);
      return {
        name,
        date: format(date, "dd/MM", { locale: ptBR }),
        planejadas: 0,
        concluídas: 0,
        'não feitas': 0
      };
    });
    
    // Count tasks by day and status
    tasks.forEach(task => {
      if (!task.dailyStatus) return;
      
      task.dailyStatus.forEach(dayStatus => {
        const dayIndex = daysMapping[dayStatus.day].index;
        
        // Increment planned count for this day
        data[dayIndex].planejadas += 1;
        
        // Increment completed or not done count based on status
        if (dayStatus.status === 'completed') {
          data[dayIndex].concluídas += 1;
        } else if (dayStatus.status === 'not_done') {
          data[dayIndex]['não feitas'] += 1;
        }
      });
    });
    
    return data;
  }, [tasks, weekStartDate]);

  // Calculate completion rate per day
  const completionRates = useMemo(() => {
    return dailyData.map(day => {
      const planned = day.planejadas;
      const completed = day.concluídas;
      return {
        day: day.date,
        rate: planned > 0 ? Math.round((completed / planned) * 100) : 0
      };
    });
  }, [dailyData]);

  // Find the day with the highest completion rate
  const bestDay = useMemo(() => {
    return [...completionRates].sort((a, b) => b.rate - a.rate)[0];
  }, [completionRates]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        {bestDay && (
          <>
            <span className="text-lg font-medium">Melhor dia: {bestDay.day}</span>
            <p className="text-sm text-muted-foreground">{bestDay.rate}% de conclusão</p>
          </>
        )}
      </div>
      
      <ChartContainer 
        config={{
          "planejadas": { color: "#3b82f6" },
          "concluídas": { color: "#10b981" },
          "não feitas": { color: "#f43f5e" }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="planejadas" name="Planejadas" fill="#3b82f6" />
            <Bar dataKey="concluídas" name="Concluídas" fill="#10b981" />
            <Bar dataKey="não feitas" name="Não Feitas" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default DailyTasksChart;
