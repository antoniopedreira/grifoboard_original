
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
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center shadow-sm animate-fade-in">
          <div className="text-sm">
            <span className="font-medium text-blue-700">Filtro ativo: </span>
            <span className="text-blue-800">{selectedCause}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1"
            onClick={onClearFilter}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        </div>
      )}
    </>
  );
};

export default PCPSection;
