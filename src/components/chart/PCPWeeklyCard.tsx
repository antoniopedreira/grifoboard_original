
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyPCPData } from "@/types";
import PCPBarChart from "../PCPBarChart";

interface PCPWeeklyCardProps {
  weeklyData: WeeklyPCPData[];
}

const PCPWeeklyCard: React.FC<PCPWeeklyCardProps> = ({ weeklyData }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-300 p-4">
      <div className="pb-1">
        <h3 className="text-lg font-semibold text-slate-800">PCP por Semana</h3>
      </div>
      <PCPBarChart weeklyData={weeklyData} />
    </div>
  );
};

export default PCPWeeklyCard;
