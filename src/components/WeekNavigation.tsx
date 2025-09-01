
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { 
  formatDateRange,
  getPreviousWeekDates,
  getNextWeekDates
} from "@/utils/pcp";
import { useAuth } from "@/context/AuthContext";
import ExportPdfButton from "@/components/ExportPdfButton";

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
    <div className="flex justify-between items-center mb-8 bg-white rounded-xl shadow-sm p-4 border border-gray-100/40 backdrop-blur-sm hover:shadow transition-shadow duration-200">
      <Button 
        variant="outline" 
        size="icon"
        className="h-9 w-9 rounded-full border-gray-200 hover:bg-gray-50"
        onClick={onPreviousWeek}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium font-heading">
            {currentWeekFormatted}
          </h3>
        </div>
        {isCurrentWeek && (
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">Semana Atual</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <ExportPdfButton
          obraId={userSession.obraAtiva?.id || ""}
          obraNome={userSession.obraAtiva?.nome_obra || ""}
          weekStartDate={weekStartDate}
        />
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 rounded-full border-gray-200 hover:bg-gray-50"
          onClick={onNextWeek}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WeekNavigation;
