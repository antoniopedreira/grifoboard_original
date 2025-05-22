
import { Task } from "@/types";
import TaskList from "@/components/TaskList";
import { ClipboardList } from "lucide-react";

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskUpdate: (updatedTask: Task) => void;
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
      <div className="flex items-center mb-6">
        <ClipboardList className="h-6 w-6 mr-3 text-primary" />
        <h2 className="text-xl font-heading font-semibold">Tarefas da Semana</h2>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-white border border-gray-100 shadow-sm animate-pulse">
          <div className="h-12 w-12 rounded-full bg-gray-200 mb-3"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
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
