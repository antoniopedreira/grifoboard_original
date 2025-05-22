
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

interface TaskProgressChartProps {
  pcpData: any;
}

const TaskProgressChart: React.FC<TaskProgressChartProps> = ({ pcpData }) => {
  // If pcpData is not available or doesn't have disciplines, show empty state
  if (!pcpData || !pcpData.disciplines || pcpData.disciplines.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">Sem dados disponíveis</p>
        </div>
      </div>
    );
  }
  
  // Transform PCP data for the chart
  const chartData = pcpData.disciplines.map((discipline: any) => ({
    name: discipline.name,
    Planejado: 100,
    Executado: discipline.percentage,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis 
          tickFormatter={(tick) => `${tick}%`} 
          tick={{ fontSize: 12 }} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value) => `${value}%`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }} 
        />
        <Legend wrapperStyle={{ paddingTop: 10 }} />
        <Bar 
          dataKey="Planejado" 
          fill="#e5e7eb" 
          radius={[4, 4, 0, 0]}
          className="opacity-60"
        >
          <LabelList 
            dataKey="Planejado" 
            position="top" 
            formatter={(value: number) => `${value}%`}
            style={{ fontSize: 11, fill: '#666' }}
          />
        </Bar>
        <Bar 
          dataKey="Executado" 
          fill="#021C2F"
          radius={[4, 4, 0, 0]}
        >
          <LabelList 
            dataKey="Executado" 
            position="top" 
            formatter={(value: number) => `${Math.round(value)}%`}
            style={{ fontSize: 11, fill: '#666' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TaskProgressChart;
