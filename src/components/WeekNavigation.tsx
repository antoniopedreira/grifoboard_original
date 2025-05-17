
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { 
  formatDateRange,
  getPreviousWeekDates,
  getNextWeekDates
} from "@/utils/pcp";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";

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

  // Animation properties
  const pulseAnimation = isCurrentWeek ? "animate-pulse-slow" : "";
  
  return (
    <GlassCard className="flex justify-between items-center mb-6 p-4">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onPreviousWeek}
        className="rounded-full bg-white/20 backdrop-blur border-white/10 text-foreground hover:bg-white/30 hover:text-accent transition-all duration-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="text-center flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Calendar className={`h-5 w-5 ${isCurrentWeek ? 'text-accent' : 'text-muted-foreground'}`} />
        </motion.div>
        <div>
          <h3 className="text-xl font-semibold gradient-text">
            {currentWeekFormatted}
          </h3>
          {isCurrentWeek && (
            <motion.span 
              className="text-sm text-accent font-medium block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Semana Atual
            </motion.span>
          )}
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={onNextWeek}
        className="rounded-full bg-white/20 backdrop-blur border-white/10 text-foreground hover:bg-white/30 hover:text-accent transition-all duration-300"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </GlassCard>
  );
};

export default WeekNavigation;
