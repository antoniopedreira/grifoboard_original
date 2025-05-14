
import { PCPBreakdown, Task, WeeklyPCPData } from "@/types";
import PCPOverallCard from "./chart/PCPOverallCard";
import PCPBreakdownCard from "./chart/PCPBreakdownCard";
import CausesCountCard from "./chart/CausesCountCard";

interface PCPChartProps {
  pcpData: PCPBreakdown;
  weeklyData: WeeklyPCPData[];
  tasks: Task[];
  onCauseSelect: (cause: string) => void;
}

const PCPChart: React.FC<PCPChartProps> = ({ pcpData, weeklyData, tasks, onCauseSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Overall PCP */}
      <PCPOverallCard data={pcpData.overall} />
      
      {/* PCP by Discipline */}
      <PCPBreakdownCard title="PCP por Disciplina" data={pcpData.byDiscipline || {}} />
      
      {/* PCP by Responsible */}
      <PCPBreakdownCard title="PCP por Responsável" data={pcpData.byResponsible || {}} />

      {/* Causes Count Card */}
      <CausesCountCard tasks={tasks} onCauseSelect={onCauseSelect} />
    </div>
  );
};

export default PCPChart;
