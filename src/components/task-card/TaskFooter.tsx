
import { Button } from "@/components/ui/button";
import { Copy, Pencil } from "lucide-react";
import CausesDropdown from "../task/CausesDropdown";

interface TaskFooterProps {
  isCompleted: boolean;
  currentCause: string;
  onCauseSelect: (cause: string) => void;
  onEditClick: () => void;
  onDuplicateClick?: () => void;
}

const TaskFooter: React.FC<TaskFooterProps> = ({ 
  isCompleted, 
  currentCause, 
  onCauseSelect, 
  onEditClick,
  onDuplicateClick 
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
      
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDuplicateClick} 
          className="text-gray-700 hover:bg-gray-100"
          title="Duplicar tarefa"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEditClick} 
          className="text-gray-700 hover:bg-gray-100"
        >
          <Pencil className="mr-1 h-4 w-4" /> Editar
        </Button>
      </div>
    </div>
  );
};

export default TaskFooter;
