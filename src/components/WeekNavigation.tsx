
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md backdrop-blur-sm border border-gray-100">
      <Button 
        variant="outline" 
        size="icon"
        className="hover:bg-gray-100 transition-colors"
        onClick={onPreviousWeek}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800">
          {currentWeekFormatted}
        </h3>
        {isCurrentWeek && (
          <span className="text-sm text-green-600 font-medium">Semana Atual</span>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        className="hover:bg-gray-100 transition-colors"
        onClick={onNextWeek}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
