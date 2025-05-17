
import { Task } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface ResponsibleChartProps {
  tasks: Task[];
}

const ResponsibleChart: React.FC<ResponsibleChartProps> = ({ tasks }) => {
  // Group tasks by responsible person
  const responsibleMap = tasks.reduce<{[key: string]: number}>((acc, task) => {
    const responsible = task.responsible || "Sem responsável";
    acc[responsible] = (acc[responsible] || 0) + 1;
    return acc;
  }, {});
  
  // Transform into chart data format and sort by count in descending order
  const data = Object.entries(responsibleMap)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
  
  // Colors for different responsible people
  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#6366f1', '#14b8a6', '#f43f5e', '#d946ef'
  ];
  
  // Use a bar chart for responsible persons to better show ranking
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={70}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value} tarefas`, 'Quantidade']}
          labelFormatter={(name) => `Responsável: ${name}`}
        />
        <Bar 
          dataKey="value" 
          name="Tarefas"
          fill="#8884d8"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResponsibleChart;
