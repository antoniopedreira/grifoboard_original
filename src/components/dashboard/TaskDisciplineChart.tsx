
import { Task } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TaskDisciplineChartProps {
  tasks: Task[];
}

const TaskDisciplineChart: React.FC<TaskDisciplineChartProps> = ({ tasks }) => {
  // Group tasks by discipline
  const disciplineMap = tasks.reduce<{[key: string]: number}>((acc, task) => {
    const discipline = task.discipline || "Sem disciplina";
    acc[discipline] = (acc[discipline] || 0) + 1;
    return acc;
  }, {});
  
  // Transform into chart data format
  const data = Object.entries(disciplineMap).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Colors for different disciplines
  const COLORS = [
    '#021C2F', '#10b981', '#021C2F', '#ef4444', 
    '#021C2F', '#ec4899', '#021C2F', '#84cc16'
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
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
        <Tooltip formatter={(value) => [`${value} tarefas`, undefined]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TaskDisciplineChart;
