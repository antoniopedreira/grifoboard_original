
import { Progress } from "@/components/ui/progress";
import { PCPBreakdown, PCPData, WeeklyPCPData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PCPBarChart from "./PCPBarChart";

interface PCPChartProps {
  pcpData: PCPBreakdown;
  weeklyData: WeeklyPCPData[];
}

interface PCPProgressProps {
  data: PCPData;
  label?: string;
}

const PCPProgress: React.FC<PCPProgressProps> = ({ data, label }) => {
  const percentage = Math.round(data.percentage);
  
  // Determine color based on percentage
  let progressColor = "bg-red-500";
  if (percentage >= 80) {
    progressColor = "bg-green-500";
  } else if (percentage >= 60) {
    progressColor = "bg-yellow-500";
  } else if (percentage >= 40) {
    progressColor = "bg-orange-500";
  }
  
  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>}
      <div className="w-full flex items-center gap-2">
        <div className="w-full">
          <Progress 
            value={percentage} 
            className={`h-2 ${progressColor}`} 
          />
        </div>
        <span className="text-sm font-medium w-12 text-right">
          {data.completedTasks}/{data.totalTasks}
        </span>
      </div>
    </div>
  );
};

const PCPChart: React.FC<PCPChartProps> = ({ pcpData, weeklyData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Overall PCP */}
      <Card className="col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">PCP Geral da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center">
            <div className="text-5xl font-bold mb-2">
              {Math.round(pcpData.overall.percentage)}%
            </div>
            <PCPProgress data={pcpData.overall} />
            <div className="text-sm text-gray-500 mt-2">
              {pcpData.overall.completedTasks} de {pcpData.overall.totalTasks} tarefas concluídas
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* PCP by Sector */}
      <Card className="col-span-1 lg:col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">PCP por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(pcpData.bySector).map(([sector, data]) => (
              <PCPProgress key={sector} data={data} label={sector} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* PCP by Responsible */}
      <Card className="col-span-1 lg:col-span-1 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">PCP por Responsável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(pcpData.byResponsible).map(([responsible, data]) => (
              <PCPProgress key={responsible} data={data} label={responsible} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly PCP Chart */}
      <Card className="col-span-1 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">PCP por Semana</CardTitle>
        </CardHeader>
        <PCPBarChart weeklyData={weeklyData} />
      </Card>
    </div>
  );
};

export default PCPChart;
