
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TaskHeaderProps {
  task: Task;
  onCompletionStatusChange: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onCompletionStatusChange }) => {
  return (
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{task.description}</h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">{task.item}</p>
      </div>
      <Badge 
        className={`shrink-0 cursor-pointer text-xs whitespace-nowrap px-2 ${
          task.isFullyCompleted 
            ? "bg-green-500 hover:bg-green-600" 
            : "text-orange-500 border-orange-500 hover:bg-orange-100"
        }`}
        variant={task.isFullyCompleted ? "default" : "outline"}
        onClick={onCompletionStatusChange}
      >
        {task.isFullyCompleted ? "Concluída" : "Não Concluída"}
      </Badge>
    </div>
  );
};

export default TaskHeader;
