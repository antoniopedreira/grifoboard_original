
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TaskHeaderProps {
  task: Task;
  onCompletionStatusChange: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ task, onCompletionStatusChange }) => {
  return (
    <div className="flex justify-between">
      <div>
        <h3 className="font-semibold text-lg">{task.description}</h3>
        <p className="text-sm text-muted-foreground">{task.item}</p>
      </div>
      <Badge 
        className={`cursor-pointer ${
          task.isFullyCompleted 
            ? "bg-green-600/90 hover:bg-green-700" 
            : "text-red-400 border-red-400 hover:bg-red-500/10"
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
