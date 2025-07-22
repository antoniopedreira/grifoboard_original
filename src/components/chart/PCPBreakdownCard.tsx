
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PCPBreakdownCardProps {
  title: string;
  data: Record<string, PCPData>;
}

const PCPBreakdownCard: React.FC<PCPBreakdownCardProps> = ({ title, data }) => {
  // Sort data entries by percentage in descending order
  const sortedEntries = data 
    ? Object.entries(data).sort((a, b) => b[1].percentage - a[1].percentage)
    : [];

  return (
    <>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">{title}</CardTitle>
        </CardHeader>
      )}
      <div>
        <div className="max-h-[160px] overflow-y-auto space-y-3">
          {sortedEntries.length > 0 && sortedEntries.map(([key, value], index) => (
            <div 
              key={key} 
              className="p-3 bg-white/60 rounded-xl border border-white/40 animate-fade-in hover:bg-white/80 transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">{key}</span>
                <span className="text-sm font-bold text-slate-800">{Math.round(value.percentage)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${value.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {value.completedTasks}/{value.totalTasks}
                </span>
              </div>
            </div>
          ))}
          {(!data || Object.keys(data).length === 0) && (
            <div className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-lg">📊</span>
              </div>
              <p className="text-sm text-slate-500 text-center">Sem dados disponíveis</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PCPBreakdownCard;
