
import React, { useState, useEffect } from "react";
import { Task } from "@/types";
import TaskFilters from "./task/TaskFilters";
import TaskGrid from "./task/TaskGrid";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDuplicate: (task: Task) => void;
  onCopyToNextWeek: (task: Task) => void;
  selectedCause: string | null;
  sortBy: "none" | "sector" | "executor" | "discipline";
  onSortChange: (sortBy: "none" | "sector" | "executor" | "discipline") => void;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskDuplicate,
  onCopyToNextWeek,
  selectedCause,
  sortBy,
  onSortChange
}) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const { toast } = useToast();
  
  // Apply cause filter first if there's a selected cause
  const tasksAfterCauseFilter = selectedCause
    ? tasks.filter(task => task.causeIfNotDone === selectedCause)
    : tasks;
  
  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask);
    
    // Show a toast notification when a task is updated
      if (updatedTask.isFullyCompleted) {
        toast({
          title: "Tarefa concluída",
          description: updatedTask.description,
        });
      }
  };

  useEffect(() => {
    // When selectedCause changes, we need to reset the filteredTasks
    // to allow the TaskFilters component to work with the pre-filtered list
    setFilteredTasks(tasksAfterCauseFilter);
  }, [tasksAfterCauseFilter, selectedCause]);

  return (
    <div className="w-full space-y-6">
      <div className="glass-card p-5 rounded-xl shadow-sm">
        <TaskFilters 
          tasks={tasksAfterCauseFilter} 
          onFiltersChange={setFilteredTasks} 
          selectedCause={selectedCause}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>
      
      {selectedCause && (
        <Alert variant="success" className="flex items-center mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <div>
            <AlertTitle className="text-sm">Filtro por causa ativo</AlertTitle>
            <AlertDescription className="text-xs">
              Exibindo tarefas com a causa: <span className="font-medium">{selectedCause}</span>
            </AlertDescription>
          </div>
        </Alert>
      )}
      
      <TaskGrid 
        tasks={filteredTasks} 
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={onTaskDelete}
        onTaskDuplicate={onTaskDuplicate}
        onCopyToNextWeek={onCopyToNextWeek}
      />
    </div>
  );
};

export default React.memo(TaskList);
