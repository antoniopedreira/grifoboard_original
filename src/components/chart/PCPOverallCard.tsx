
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PCPOverallCardProps {
  data: PCPData;
}

const PCPOverallCard: React.FC<PCPOverallCardProps> = ({ data }) => {
  // Get variation directly from the data prop
  const variation = data.variation || 0;
  const isPositive = variation >= 0;
  const hasPreviousData = data.previousWeekPercentage !== undefined && data.previousWeekPercentage > 0;
  
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
          
          {hasPreviousData ? (
            <div className={`flex items-center mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUp size={14} className="mr-1" />
              ) : (
                <ArrowDown size={14} className="mr-1" />
              )}
              <span>
                {isPositive ? '+' : ''}{variation.toFixed(1)}% em relação à semana anterior
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 mt-1">
              Sem dado anterior
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PCPOverallCard;
