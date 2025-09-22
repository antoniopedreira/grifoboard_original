
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
        <ScrollArea className="h-[200px] w-full">
          <div className="space-y-1 pr-2">
            {sortedEntries.length > 0 && sortedEntries.map(([key, value], index) => (
              <div 
                key={key} 
                className="py-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 truncate flex-1 mr-2 uppercase">{key}</span>
                  <span className="text-sm font-bold text-slate-800 flex-shrink-0">{Math.round(value.percentage)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${value.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium flex-shrink-0">
                    {value.completedTasks}/{value.totalTasks}
                  </span>
                </div>
              </div>
            ))}
            {(!data || Object.keys(data).length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">📊</span>
                </div>
                <p className="text-xs text-slate-500 text-center">Sem dados disponíveis</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default PCPBreakdownCard;
