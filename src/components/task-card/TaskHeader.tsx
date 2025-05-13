
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
        <h3 className="font-semibold">{task.description}</h3>
        <p className="text-sm text-gray-500">{task.item}</p>
      </div>
      <Badge 
        className={`cursor-pointer ${
          task.completionStatus === "completed" 
            ? "bg-green-500 hover:bg-green-600" 
            : "text-orange-500 border-orange-500 hover:bg-orange-100"
        }`}
        variant={task.completionStatus === "completed" ? "default" : "outline"}
        onClick={onCompletionStatusChange}
      >
        {task.completionStatus === "completed" ? "Concluída" : "Não Concluída"}
      </Badge>
    </div>
  );
};

export default TaskHeader;
