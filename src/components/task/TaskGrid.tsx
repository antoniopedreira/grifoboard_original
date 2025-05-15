
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
      <div className="flex items-center justify-center py-12 px-4 border rounded-2xl bg-secondary/50 text-center">
        <p className="text-muted-foreground text-lg">Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
