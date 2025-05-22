
import TaskCard from "../TaskCard";
import { Task } from "@/types";
import { ClipboardX } from "lucide-react";

interface TaskGridProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: Task) => void;
}

const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onTaskUpdate, onTaskDelete, onTaskDuplicate }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-white border border-gray-100 shadow-sm">
        <ClipboardX className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 text-base">Nenhuma tarefa encontrada</p>
        <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros ou criar uma nova tarefa</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onTaskDuplicate={onTaskDuplicate}
        />
      ))}
    </div>
  );
};

export default TaskGrid;
