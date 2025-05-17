
import { useState, useEffect } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculatePCP } from "@/utils/pcp";
import { Task } from "@/types";

interface ExecutorChartProps {
  weekStartDate: Date;
}

const ExecutorChart = ({ weekStartDate }: ExecutorChartProps) => {
  const { allTasks } = useTaskManager(weekStartDate);
  const [executorData, setExecutorData] = useState<{ name: string; percentual: number }[]>([]);

  useEffect(() => {
    // Filter tasks for the current week
    const tasksForWeek = allTasks.filter(task => {
      if (!task.weekStartDate) return false;
      const taskDate = new Date(task.weekStartDate);
      return taskDate.toISOString().split('T')[0] === weekStartDate.toISOString().split('T')[0];
    });

    // Group tasks by executor
    const executorGroups = tasksForWeek.reduce<Record<string, Task[]>>((acc, task) => {
      const executor = task.executor || 'Não definido';
      if (!acc[executor]) {
        acc[executor] = [];
      }
      acc[executor].push(task);
      return acc;
    }, {});

    // Calculate PCP for each executor group
    const data = Object.entries(executorGroups).map(([executor, tasks]) => {
      const pcpData = calculatePCP(tasks);
      return {
        name: executor,
        percentual: Math.round(pcpData.overall.percentage)
      };
    });

    // Sort by percentage descending
    data.sort((a, b) => b.percentual - a.percentual);
    
    setExecutorData(data);
  }, [allTasks, weekStartDate]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Tarefas por Executante</CardTitle>
      </CardHeader>
      <CardContent>
        {executorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={executorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value}%`, 'PCP']} />
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <Bar dataKey="percentual" fill="#3B82F6" radius={[0, 4, 4, 0]} />
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

export default ExecutorChart;
