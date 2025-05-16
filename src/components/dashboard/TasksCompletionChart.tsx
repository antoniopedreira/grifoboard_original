
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

  return (
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
  );
};

export default TasksCompletionChart;
