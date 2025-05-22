
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
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl bg-white border border-gray-100 shadow-sm">
        <div className="bg-gray-50 p-3 rounded-full mb-4">
          <ClipboardX className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-gray-700 font-medium mb-2">Nenhuma tarefa encontrada</h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Tente ajustar os filtros ou criar uma nova tarefa
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
