
import { PCPBreakdown, Task, WeeklyPCPData } from "@/types";
import PCPOverallCard from "./chart/PCPOverallCard";
import PCPBreakdownCard from "./chart/PCPBreakdownCard";
import CausesCountCard from "./chart/CausesCountCard";
import { BookOpen, Users, UserCheck } from "lucide-react";

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
      <div className="glass-card rounded-xl shadow-sm hover:shadow transition-shadow duration-200">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium font-heading">PCP por Disciplina</h3>
          </div>
          <PCPBreakdownCard title="" data={pcpData.byDiscipline || {}} />
        </div>
      </div>
      
      {/* PCP by Responsible */}
      <div className="glass-card rounded-xl shadow-sm hover:shadow transition-shadow duration-200">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <UserCheck className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium font-heading">PCP por Responsável</h3>
          </div>
          <PCPBreakdownCard title="" data={pcpData.byResponsible || {}} />
        </div>
      </div>

      {/* Causes Count Card */}
      <CausesCountCard tasks={tasks} onCauseSelect={onCauseSelect} />
    </div>
  );
};

export default PCPChart;
