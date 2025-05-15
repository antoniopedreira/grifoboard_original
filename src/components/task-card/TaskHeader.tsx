
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
        <h3 className="font-semibold text-gray-900">{task.description}</h3>
        <p className="text-sm text-gray-500">{task.item}</p>
      </div>
      <Badge 
        className={`cursor-pointer ${
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
