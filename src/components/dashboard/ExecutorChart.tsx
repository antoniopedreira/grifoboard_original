import React, { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from 'recharts';
import { calculatePCP } from "@/utils/pcp";
import { Task } from "@/types";
import { BarChart2 } from "lucide-react";

interface ExecutorChartProps {
  weekStartDate: Date;
  tasks: Task[];
}

const ExecutorChart = ({
  weekStartDate,
  tasks
}: ExecutorChartProps) => {
  // Memoize executor data calculation to prevent recalculations
  const executorData = useMemo(() => {
    const tasksForWeek = tasks;

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
        name: executor.toUpperCase(),
        percentual: Math.round(pcpData.overall.percentage)
      };
    });

    // Sort by percentage descending and limit to top 10
    data.sort((a, b) => b.percentual - a.percentual);
    return data.slice(0, 10);
  }, [tasks]);

  return (
    <div className="w-full min-h-[380px] h-[380px] border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <BarChart2 className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium font-heading">PCP por Encarregado</h3>
      </div>
      
      {executorData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={executorData}
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
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={value => [`${value}%`, 'PCP']} />
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
            <Bar 
              dataKey="percentual" 
              fill="#021C2F" 
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
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

export default React.memo(ExecutorChart);