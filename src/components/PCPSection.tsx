
import { Task } from "@/types";
import PCPChart from "@/components/PCPChart";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";

interface PCPSectionProps {
  pcpData: any;
  weeklyPCPData: any[];
  tasks: Task[];
  selectedCause: string | null;
  onCauseSelect: (cause: string) => void;
  onClearFilter: () => void;
}

const PCPSection: React.FC<PCPSectionProps> = ({ 
  pcpData, 
  weeklyPCPData, 
  tasks, 
  selectedCause, 
  onCauseSelect,
  onClearFilter
}) => {
  return (
    <>
      {/* PCP Charts */}
      <PCPChart 
        pcpData={pcpData} 
        weeklyData={weeklyPCPData}
        tasks={tasks}
        onCauseSelect={onCauseSelect}
      />
      
      {selectedCause && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <GlassCard className="mb-4 flex justify-between items-center py-3 px-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-accent rounded-full mr-3"></div>
              <div className="text-sm">
                <span className="font-medium">Filtro ativo: </span>
                <span className="text-accent">{selectedCause}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilter}
              className="hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </GlassCard>
        </motion.div>
      )}
    </>
  );
};

export default PCPSection;
