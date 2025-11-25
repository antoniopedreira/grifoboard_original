
import { Task } from "@/types";
import TaskList from "@/components/TaskList";
import { ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TasksSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDuplicate: (task: Task) => void;
  onCopyToNextWeek: (task: Task) => void;
  selectedCause: string | null;
  sortBy: "none" | "sector" | "executor" | "discipline";
  onSortChange: (sortBy: "none" | "sector" | "executor" | "discipline") => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({ 
  tasks, 
  isLoading, 
  onTaskUpdate, 
  onTaskDelete,
  onTaskDuplicate,
  onCopyToNextWeek,
  selectedCause,
  sortBy,
  onSortChange
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClipboardList className="h-6 w-6 mr-3 text-primary" />
          <h2 className="text-xl font-heading font-semibold">Tarefas da Semana</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Organizar por:</span>
          <Select 
            value={sortBy} 
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="sector">Setor</SelectItem>
              <SelectItem value="executor">Executante</SelectItem>
              <SelectItem value="discipline">Disciplina</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading && tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-white border border-gray-100 shadow-sm animate-pulse min-h-[280px]">
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
          onCopyToNextWeek={onCopyToNextWeek}
          selectedCause={selectedCause}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      )}
    </>
  );
};

export default TasksSection;
