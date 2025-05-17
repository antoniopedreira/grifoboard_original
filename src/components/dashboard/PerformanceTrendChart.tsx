
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceTrendChartProps {
  weeklyPCPData: any[];
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ weeklyPCPData }) => {
  // Format data for chart
  const chartData = weeklyPCPData.map(weekData => {
    const weekDate = weekData.date ? new Date(weekData.date) : new Date();
    return {
      name: format(weekDate, "dd/MM", { locale: ptBR }),
      PCP: weekData.percentage || 0,
    };
  });
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(tick) => `${tick}%`} domain={[0, 100]} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="PCP"
          stroke="#3b82f6"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceTrendChart;
