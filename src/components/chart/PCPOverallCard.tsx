
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PCPOverallCardProps {
  data: PCPData;
}

const PCPOverallCard: React.FC<PCPOverallCardProps> = ({ data }) => {
  // Calculate percentage variation (mocked for now)
  // In a real implementation, this would come from the data prop
  const previousWeekPercentage = data.previousWeekPercentage || Math.max(0, Math.round(data.percentage) - Math.floor(Math.random() * 20) + 10);
  const variation = Math.round(data.percentage - previousWeekPercentage);
  const isPositive = variation >= 0;
  
  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">PCP Geral da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center">
          <div className="text-5xl font-bold mb-2">
            {Math.round(data.percentage)}%
          </div>
          <PCPProgress data={data} />
          <div className="text-sm text-gray-500 mt-2">
            {data.completedTasks} de {data.totalTasks} tarefas concluídas
          </div>
          
          {/* Variation indicator */}
          <div className={`flex items-center mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <ArrowUp size={14} className="mr-1" />
            ) : (
              <ArrowDown size={14} className="mr-1" />
            )}
            <span>{isPositive ? '+' : ''}{variation}% em relação à semana anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PCPOverallCard;
