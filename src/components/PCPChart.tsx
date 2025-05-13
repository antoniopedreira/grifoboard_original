
import { PCPBreakdown, WeeklyPCPData } from "@/types";
import PCPOverallCard from "./chart/PCPOverallCard";
import PCPBreakdownCard from "./chart/PCPBreakdownCard";
import PCPWeeklyCard from "./chart/PCPWeeklyCard";

interface PCPChartProps {
  pcpData: PCPBreakdown;
  weeklyData: WeeklyPCPData[];
}

const PCPChart: React.FC<PCPChartProps> = ({ pcpData, weeklyData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Overall PCP */}
      <PCPOverallCard data={pcpData.overall} />
      
      {/* PCP by Sector */}
      <PCPBreakdownCard title="PCP por Setor" data={pcpData.bySector} />
      
      {/* PCP by Responsible */}
      <PCPBreakdownCard title="PCP por Responsável" data={pcpData.byResponsible} />

      {/* Weekly PCP Chart */}
      <PCPWeeklyCard weeklyData={weeklyData} />
    </div>
  );
};

export default PCPChart;
