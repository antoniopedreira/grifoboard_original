
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { BarChart2 } from "lucide-react";

interface PCPOverallCardProps {
  data: PCPData;
}

const PCPOverallCard: React.FC<PCPOverallCardProps> = ({ data }) => {
  const percentage = Math.round(data.percentage);
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-500/10 to-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
      
      <div className="relative p-6">
        <div className="flex items-center mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <BarChart2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 ml-3">PCP Geral da Semana</h3>
        </div>
        
        <div className="flex flex-col justify-center items-center space-y-4">
          {/* Circular Progress Indicator */}
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.83} 283`}
                className="text-primary transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-slate-600 mb-1">
              {data.completedTasks} de {data.totalTasks} tarefas concluídas
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-500">Concluídas</span>
              <div className="w-2 h-2 rounded-full bg-slate-300 ml-3"></div>
              <span className="text-xs text-slate-500">Pendentes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCPOverallCard;
