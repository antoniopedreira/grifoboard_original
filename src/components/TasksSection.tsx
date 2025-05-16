
import { Task } from "@/types";
import TaskList from "@/components/TaskList";

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDuplicate: (task: Task) => void;
  selectedCause: string | null;
}

const TasksSection: React.FC<TasksSectionProps> = ({ 
  tasks, 
  isLoading, 
  onTaskUpdate, 
  onTaskDelete,
  onTaskDuplicate,
  selectedCause 
}) => {
  return (
    <>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          <p>Carregando tarefas...</p>
        </div>
      ) : (
        <TaskList 
          tasks={tasks} 
          onTaskUpdate={onTaskUpdate} 
          onTaskDelete={onTaskDelete}
          onTaskDuplicate={onTaskDuplicate}
          selectedCause={selectedCause}
        />
      )}
    </>
  );
};

export default TasksSection;
