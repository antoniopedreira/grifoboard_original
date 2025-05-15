
import TaskCard from "../TaskCard";
import { Task } from "@/types";

interface TaskGridProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onTaskUpdate, onTaskDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 px-4 border rounded-lg bg-gray-50">
        <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
        />
      ))}
    </div>
  );
};

export default TaskGrid;
