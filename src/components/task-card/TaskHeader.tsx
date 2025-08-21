
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleX } from "lucide-react";

interface TaskHeaderProps {
  task: Task;
  onCompletionStatusChange: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onCompletionStatusChange }) => {
  return (
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1 min-w-0" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>
        <h3 
          className="font-medium text-gray-800 mb-1"
          style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}
        >
          {task.description}
        </h3>
        <p 
          className="text-xs text-gray-500"
          style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}
        >
          {task.item}
        </p>
      </div>
      
      {task.isFullyCompleted ? (
        <Badge 
          className="shrink-0 cursor-pointer px-2 py-0.5 h-6 bg-green-100 hover:bg-green-200 text-green-700 border-green-200 flex items-center gap-1 whitespace-nowrap"
          variant="outline"
          onClick={onCompletionStatusChange}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
          Concluída
        </Badge>
      ) : (
        <Badge 
          className="shrink-0 cursor-pointer px-2 py-0.5 h-6 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 flex items-center gap-1 whitespace-nowrap"
          variant="outline"
          onClick={onCompletionStatusChange}
        >
          <CircleX className="h-3.5 w-3.5 mr-0.5" />
          Não Concluída
        </Badge>
      )}
    </div>
  );
};

export default TaskHeader;
