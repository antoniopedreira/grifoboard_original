
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { BarChart2 } from "lucide-react";

interface PCPOverallCardProps {
  data: PCPData;
}

const PCPOverallCard: React.FC<PCPOverallCardProps> = ({ data }) => {
  return (
    <div className="glass-card rounded-xl shadow-sm hover:shadow transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium font-heading">PCP Geral da Semana</h3>
        </div>
        
        <div className="flex flex-col justify-center items-center">
          <div className="text-4xl font-bold mb-3 text-primary">
            {Math.round(data.percentage)}%
          </div>
          <PCPProgress data={data} />
          <div className="text-sm text-gray-500 mt-3">
            {data.completedTasks} de {data.totalTasks} tarefas concluídas
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCPOverallCard;
