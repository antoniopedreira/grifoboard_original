import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, FileDown } from "lucide-react";
import { formatDateRange } from "@/utils/pcp";
import { useAuth } from "@/context/AuthContext";
import ExportDialog from "@/components/ExportDialog";
import { cn } from "@/lib/utils";

interface WeekNavigationProps {
  weekStartDate: Date;
  weekEndDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekNavigation = ({
  weekStartDate,
  weekEndDate,
  onPreviousWeek,
  onNextWeek
}: WeekNavigationProps) => {
  const { userSession } = useAuth();
  const currentWeekFormatted = formatDateRange(weekStartDate, weekEndDate);
  const today = new Date();
  const isCurrentWeek = 
    weekStartDate.getTime() <= today.getTime() && 
    today.getTime() <= weekEndDate.getTime();
    
  return (
    <div className="flex items-center gap-1.5">
      {/* Botão Anterior */}
      <Button 
        variant="ghost" 
        size="icon"
        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        onClick={onPreviousWeek}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Container da Data */}
      <div className="flex items-center gap-3 bg-slate-50/80 rounded-xl px-4 py-2 border border-border/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              {currentWeekFormatted}
            </span>
            {isCurrentWeek && (
              <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
                Semana Atual
              </span>
            )}
          </div>
        </div>
        
        {/* Separador */}
        <div className="h-6 w-px bg-border/50" />
        
        {/* Botão Export */}
        <ExportDialog
          obraId={userSession.obraAtiva?.id || ""}
          obraNome={userSession.obraAtiva?.nome_obra || ""}
          weekStartDate={weekStartDate}
        />
      </div>
      
      {/* Botão Próximo */}
      <Button 
        variant="ghost" 
        size="icon"
        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        onClick={onNextWeek}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
