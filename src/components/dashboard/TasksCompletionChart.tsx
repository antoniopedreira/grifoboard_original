
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Task } from "@/types";
import { ChartContainer } from "@/components/ui/chart";

interface TasksCompletionChartProps {
  tasks: Task[];
}

const TasksCompletionChart: React.FC<TasksCompletionChartProps> = ({ tasks }) => {
  // Count completed and incomplete tasks
  const completedTasks = tasks.filter(task => task.isFullyCompleted).length;
  const incompleteTasks = tasks.length - completedTasks;
  
  const data = [
    { name: "Concluídas", value: completedTasks },
    { name: "Não Concluídas", value: incompleteTasks }
  ];

  const COLORS = ["#10b981", "#f43f5e"];
  
  // Calculate percentage for display
  const completionRate = tasks.length > 0 ? 
    Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-2xl font-bold">{completionRate}%</span>
        <p className="text-sm text-muted-foreground">Taxa de conclusão</p>
      </div>
      
      <ChartContainer
        config={{
          "Concluídas": { color: "#10b981" },
          "Não Concluídas": { color: "#f43f5e" }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} tarefas`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default TasksCompletionChart;
