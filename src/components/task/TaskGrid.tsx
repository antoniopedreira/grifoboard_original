
import TaskCard from "../TaskCard";
import { Task } from "@/types";

interface TaskGridProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onTaskUpdate }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
};

export default TaskGrid;
