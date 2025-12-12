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
  // Assume a semana atual baseada na primeira tarefa ou data de hoje
  const currentWeekStart =
    tasks.length > 0 ? startOfWeek(new Date(tasks[0].created_at || new Date()), { weekStartsOn: 1 }) : new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Card 1: Indicador Principal (Circular) */}
      <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
        <PCPOverallCard
          data={pcpData?.overall || { percentage: 0, completedTasks: 0, totalTasks: 0 }}
          className="h-full bg-white border-border/60 shadow-md hover:shadow-xl transition-all duration-300"
        />
      </motion.div>

      {/* Card 2: Causas de Não Execução (Interativo) */}
      <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
        <Card className="h-full bg-white border-border/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Reutilizando o componente de causas do Dashboard, mas adaptado */}
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
