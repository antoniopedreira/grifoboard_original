
import { useState, useEffect } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculatePCP } from "@/utils/pcp";
import { Task } from "@/types";

interface ResponsibleChartProps {
  weekStartDate: Date;
}

const ResponsibleChart = ({ weekStartDate }: ResponsibleChartProps) => {
  const { allTasks } = useTaskManager(weekStartDate);
  const [responsibleData, setResponsibleData] = useState<{ name: string; percentual: number }[]>([]);

  useEffect(() => {
    // Filter tasks for the current week
    const tasksForWeek = allTasks.filter(task => {
      if (!task.weekStartDate) return false;
      const taskDate = new Date(task.weekStartDate);
      return taskDate.toISOString().split('T')[0] === weekStartDate.toISOString().split('T')[0];
    });

    // Group tasks by responsible
    const responsibleGroups = tasksForWeek.reduce<Record<string, Task[]>>((acc, task) => {
      const responsible = task.responsible || 'Não definido';
      if (!acc[responsible]) {
        acc[responsible] = [];
      }
      acc[responsible].push(task);
      return acc;
    }, {});

    // Calculate PCP for each responsible group
    const data = Object.entries(responsibleGroups).map(([responsible, tasks]) => {
      const pcpData = calculatePCP(tasks);
      return {
        name: responsible,
        percentual: Math.round(pcpData.overall.percentage)
      };
    });

    // Sort by percentage descending
    data.sort((a, b) => b.percentual - a.percentual);
    
    setResponsibleData(data);
  }, [allTasks, weekStartDate]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Tarefas por Responsável</CardTitle>
      </CardHeader>
      <CardContent>
        {responsibleData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsibleData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value}%`, 'PCP']} />
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <Bar dataKey="percentual" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-400">
            Sem dados disponíveis para esta semana
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsibleChart;
