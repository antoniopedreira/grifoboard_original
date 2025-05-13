
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyPCPData } from "@/types";
import PCPBarChart from "../PCPBarChart";

interface PCPWeeklyCardProps {
  weeklyData: WeeklyPCPData[];
}

const PCPWeeklyCard: React.FC<PCPWeeklyCardProps> = ({ weeklyData }) => {
  // Determine highlight based on latest week data
  const getCardHighlightClass = (data: WeeklyPCPData[]): string => {
    if (!data || data.length === 0) return "";
    
    const latestWeekPercentage = data[data.length - 1]?.percentage || 0;
    
    if (latestWeekPercentage >= 80) return "card-highlight card-highlight-good";
    if (latestWeekPercentage >= 60) return "card-highlight card-highlight-medium";
    return "card-highlight card-highlight-bad";
  };

  return (
    <Card className={`col-span-1 shadow-sm bg-[#E0E2EC] ${getCardHighlightClass(weeklyData)}`}>
      <CardHeader className="pb-1">
        <CardTitle className="text-lg text-[#081C2C]">PCP por Semana</CardTitle>
      </CardHeader>
      <PCPBarChart weeklyData={weeklyData} />
    </Card>
  );
};

export default PCPWeeklyCard;
