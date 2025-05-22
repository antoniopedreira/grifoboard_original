
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CircleX } from "lucide-react";

interface TaskHeaderProps {
  task: Task;
  onCompletionStatusChange: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onCompletionStatusChange }) => {
  return (
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{task.description}</h3>
        <p className="text-xs text-gray-500 truncate mt-1">{task.item}</p>
      </div>
      
      {task.isFullyCompleted ? (
        <Badge 
          className="shrink-0 cursor-pointer text-xs px-2 py-0.5 h-6 bg-green-100 hover:bg-green-200 text-green-700 border-green-200 flex items-center gap-1"
          variant="outline"
          onClick={onCompletionStatusChange}
        >
          <CheckCircle2 className="h-3 w-3" />
          Concluída
        </Badge>
      ) : (
        <Badge 
          className="shrink-0 cursor-pointer text-xs px-2 py-0.5 h-6 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 flex items-center gap-1"
          variant="outline"
          onClick={onCompletionStatusChange}
        >
          <CircleX className="h-3 w-3" />
          Não Concluída
        </Badge>
      )}
    </div>
  );
};

export default TaskHeader;
