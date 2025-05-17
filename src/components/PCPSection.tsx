
import { Task } from "@/types";
import PCPChart from "@/components/PCPChart";
import { Button } from "@/components/ui/button";

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
        <div className="mb-4 px-4 py-2 bg-muted rounded-lg flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Filtro ativo: </span>
            <span className="text-primary">{selectedCause}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilter}
          >
            Limpar
          </Button>
        </div>
      )}
    </>
  );
};

export default PCPSection;
