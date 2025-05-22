
import { useState, useEffect } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { calculatePCP } from "@/utils/pcp";
import { Task } from "@/types";
import { Users } from "lucide-react";

interface TeamChartProps {
  weekStartDate: Date;
}

const TeamChart = ({
  weekStartDate
}: TeamChartProps) => {
  const { allTasks } = useTaskManager(weekStartDate);
  const [teamData, setTeamData] = useState<{ name: string; percentual: number; }[]>([]);

  useEffect(() => {
    // Filter tasks for the current week
    const tasksForWeek = allTasks.filter(task => {
      if (!task.weekStartDate) return false;
      const taskDate = new Date(task.weekStartDate);
      return taskDate.toISOString().split('T')[0] === weekStartDate.toISOString().split('T')[0];
    });

    // Group tasks by team
    const teamGroups = tasksForWeek.reduce<Record<string, Task[]>>((acc, task) => {
      const team = task.team || 'Não definido';
      if (!acc[team]) {
        acc[team] = [];
      }
      acc[team].push(task);
      return acc;
    }, {});

    // Calculate PCP for each team group
    const data = Object.entries(teamGroups).map(([team, tasks]) => {
      const pcpData = calculatePCP(tasks);
      return {
        name: team,
        percentual: Math.round(pcpData.overall.percentage)
      };
    });

    // Sort by percentage descending
    data.sort((a, b) => b.percentual - a.percentual);
    setTeamData(data);
  }, [allTasks, weekStartDate]);

  return (
    <div className="w-full h-[380px]">
      <div className="flex items-center mb-4">
        <Users className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium font-heading">PCP por Equipe</h3>
      </div>
      
      {teamData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={teamData}
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
              fill="#0c4a6e" 
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

export default TeamChart;
