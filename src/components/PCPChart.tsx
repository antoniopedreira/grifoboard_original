
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Overall PCP */}
      <PCPOverallCard data={pcpData.overall} />
      
      {/* PCP by Discipline */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-400/5 rounded-full -translate-y-6 translate-x-6"></div>
        
        <div className="relative p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 ml-3">PCP por Disciplina</h3>
          </div>
          <div className="space-y-3">
            <PCPBreakdownCard title="" data={pcpData.byDiscipline || {}} />
          </div>
        </div>
      </div>
      
      {/* PCP by Responsible */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 rounded-full -translate-y-6 translate-x-6"></div>
        
        <div className="relative p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 ml-3">PCP por Responsável</h3>
          </div>
          <div className="space-y-3">
            <PCPBreakdownCard title="" data={pcpData.byResponsible || {}} />
          </div>
        </div>
      </div>

      {/* Causes Count Card */}
      <CausesCountCard tasks={tasks} onCauseSelect={onCauseSelect} />
    </div>
  );
};

export default PCPChart;
