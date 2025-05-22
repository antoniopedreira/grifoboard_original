
import { Task } from "@/types";
import PCPChart from "@/components/PCPChart";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

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
        <div className="mb-6 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center animate-fade-in">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Filtro ativo: </span>
            <span className="text-primary font-medium">{selectedCause}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-xs hover:bg-blue-100 text-blue-600"
            onClick={onClearFilter}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Limpar filtro
          </Button>
        </div>
      )}
    </>
  );
};

export default PCPSection;
