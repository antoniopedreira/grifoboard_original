
import { useState, useEffect } from "react";
import { Task } from "@/types";
import TaskFilters from "./task/TaskFilters";
import TaskGrid from "./task/TaskGrid";
import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete: (taskId: string) => void;
  selectedCause: string | null;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate, onTaskDelete, selectedCause }) => {
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
    <div className="w-full">
      <TaskFilters 
        tasks={tasksAfterCauseFilter} 
        onFiltersChange={setFilteredTasks} 
        selectedCause={selectedCause}
      />
      
      <TaskGrid 
        tasks={filteredTasks} 
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
};

export default TaskList;
