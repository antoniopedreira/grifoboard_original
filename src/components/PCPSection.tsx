import { PCPBreakdown, WeeklyPCPData, Task } from "@/types";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import PCPOverallCard from "@/components/chart/PCPOverallCard";
import WeeklyCausesChart from "@/components/dashboard/WeeklyCausesChart";
import { startOfWeek } from "date-fns";

interface PCPSectionProps {
  pcpData: PCPBreakdown;
  weeklyPCPData: WeeklyPCPData[];
  tasks: Task[];
  selectedCause: string | null;
  onCauseSelect: (cause: string) => void;
  onClearFilter: () => void;
}

const PCPSection = ({ pcpData, tasks }: PCPSectionProps) => {
  const currentWeekStart =
    tasks.length > 0 ? startOfWeek(new Date(tasks[0].created_at || new Date()), { weekStartsOn: 1 }) : new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-stretch">
      {/* Card 1: Indicador Principal */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full min-h-[300px]"
      >
        <PCPOverallCard
          data={pcpData?.overall || { percentage: 0, completedTasks: 0, totalTasks: 0 }}
          className="h-full bg-white border-border/60 shadow-md hover:shadow-xl transition-all duration-300"
        />
      </motion.div>

      {/* Card 2: Causas */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="h-full min-h-[300px]"
      >
        <Card className="h-full bg-white border-border/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <WeeklyCausesChart
            tasks={tasks}
            weekStartDate={currentWeekStart}
            className="h-full border-none shadow-none"
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default PCPSection;
