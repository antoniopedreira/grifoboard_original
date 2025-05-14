
import { Task } from "@/types";
import TaskList from "@/components/TaskList";

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  selectedCause: string | null;
}

const TasksSection: React.FC<TasksSectionProps> = ({ 
  tasks, 
  isLoading, 
  onTaskUpdate, 
  onTaskDelete, 
  selectedCause 
}) => {
  return (
    <>
      {isLoading ? (
        <div className="text-center py-10">
          <p>Carregando tarefas...</p>
        </div>
      ) : (
        <TaskList 
          tasks={tasks} 
          onTaskUpdate={onTaskUpdate} 
          onTaskDelete={onTaskDelete}
          selectedCause={selectedCause}
        />
      )}
    </>
  );
};

export default TasksSection;
