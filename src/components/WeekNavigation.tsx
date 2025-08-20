
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { 
  formatDateRange,
  getPreviousWeekDates,
  getNextWeekDates
} from "@/utils/pcp";

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
  const currentWeekFormatted = formatDateRange(weekStartDate, weekEndDate);
  const today = new Date();
  const isCurrentWeek = 
    weekStartDate.getTime() <= today.getTime() && 
    today.getTime() <= weekEndDate.getTime();
    
  return (
    <div className="flex justify-between items-center bg-grifo-surface rounded-grifo-lg p-4 shadow-grifo">
      {/* Botão semana anterior */}
      <Button 
        variant="outline" 
        size="icon"
        className="h-10 w-10 rounded-grifo border-border hover:bg-primary/10 hover:border-primary"
        onClick={onPreviousWeek}
      >
        <ChevronLeft className="h-5 w-5 text-accent" />
      </Button>
      
      {/* WeekBar central - destaque */}
      <div className="flex flex-col items-center px-6">
        <div className="flex items-center mb-1">
          <Calendar className="h-6 w-6 mr-3 text-primary" />
          <h3 className="grifo-h3 text-accent">
            {currentWeekFormatted}
          </h3>
        </div>
        {isCurrentWeek && (
          <div className="grifo-chip-success">Semana Atual</div>
        )}
      </div>
      
      {/* Botão próxima semana */}
      <Button 
        variant="outline" 
        size="icon"
        className="h-10 w-10 rounded-grifo border-border hover:bg-primary/10 hover:border-primary"
        onClick={onNextWeek}
      >
        <ChevronRight className="h-5 w-5 text-accent" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
