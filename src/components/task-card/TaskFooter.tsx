
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import CausesDropdown from "../task/CausesDropdown";

interface TaskFooterProps {
  isCompleted: boolean;
  currentCause: string;
  onCauseSelect: (cause: string) => void;
  onEditClick: () => void;
}

const TaskFooter: React.FC<TaskFooterProps> = ({ 
  isCompleted, 
  currentCause, 
  onCauseSelect, 
  onEditClick 
}) => {
  return (
    <div className="w-full flex justify-between items-center">
      {!isCompleted ? (
        <CausesDropdown 
          onCauseSelect={onCauseSelect}
          currentCause={currentCause}
        />
      ) : (
        <span />
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onEditClick}
        className="hover:bg-[#EEEBEB] text-[#081C2C]"
      >
        <Pencil className="mr-1 h-4 w-4" /> Editar
      </Button>
    </div>
  );
};

export default TaskFooter;
