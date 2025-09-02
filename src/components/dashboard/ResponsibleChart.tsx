import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { calculatePCP } from "@/utils/pcp";
import { Task } from "@/types";
import { BarChart2 } from "lucide-react";

interface ResponsibleChartProps {
  weekStartDate: Date;
  tasks: Task[];
}

const ResponsibleChart = ({
  weekStartDate,
  tasks
}: ResponsibleChartProps) => {
  const [responsibleData, setResponsibleData] = useState<{ name: string; percentual: number; }[]>([]);

  useEffect(() => {
    // Use the tasks passed as props directly
    const tasksForWeek = tasks;

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
        name: responsible.toUpperCase(),
        percentual: Math.round(pcpData.overall.percentage)
      };
    });

    // Sort by percentage descending
    data.sort((a, b) => b.percentual - a.percentual);
    
    const processedData = data.slice(0, 10); // Limit to top 10
    setResponsibleData(processedData);
  }, [tasks]); // Changed dependency from allTasks to tasks

  return (
    <div className="w-full h-[380px] border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <BarChart2 className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium font-heading">PCP por Responsável</h3>
      </div>
      
      {responsibleData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={responsibleData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={value => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={value => [`${value}%`, 'PCP']} />
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
            <Bar 
              dataKey="percentual" 
              fill="#021C2F" 
              radius={[0, 4, 4, 0]} 
            >
              <LabelList 
                dataKey="percentual" 
                position="right" 
                formatter={(value: number) => `${Math.round(value)}%`}
                style={{ fontSize: 11, fill: '#64748b' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[300px] items-center justify-center text-gray-400">
          Sem dados disponíveis para esta semana
        </div>
      )}
    </div>
  );
};

export default ResponsibleChart;