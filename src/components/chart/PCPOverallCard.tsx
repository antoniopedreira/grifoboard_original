
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";

interface PCPOverallCardProps {
  data: PCPData;
}

const PCPOverallCard: React.FC<PCPOverallCardProps> = ({ data }) => {
  const getCardHighlightClass = (percentage: number): string => {
    if (percentage >= 80) return "card-highlight card-highlight-good";
    if (percentage >= 60) return "card-highlight card-highlight-medium";
    return "card-highlight card-highlight-bad";
  };

  return (
    <Card className={`col-span-1 shadow-sm bg-[#E0E2EC] ${getCardHighlightClass(data.percentage)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#081C2C]">PCP Geral da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center items-center">
          <div className="text-5xl font-bold mb-2 text-[#081C2C]">
            {Math.round(data.percentage)}%
          </div>
          <PCPProgress data={data} />
          <div className="text-sm text-gray-600 mt-2">
            {data.completedTasks} de {data.totalTasks} tarefas concluídas
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PCPOverallCard;
