
import { useState, useEffect } from "react";
import { Task } from "@/types";
import TaskFilters from "./task/TaskFilters";
import TaskGrid from "./task/TaskGrid";
import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
}

const TASKS_PER_PAGE = 15;

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();
  
  // Reset to page 1 when tasks are updated
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);
  
  const handleTaskUpdate = (updatedTask: Task) => {
    onTaskUpdate(updatedTask);
    
    // Show a toast notification when a task is updated
    if (updatedTask.completionStatus === "completed") {
      toast({
        title: "Tarefa concluída",
        description: updatedTask.description,
      });
    }
  };

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
  const endIndex = Math.min(startIndex + TASKS_PER_PAGE, filteredTasks.length);
  const currentTasks = filteredTasks.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };
  
  const handleFiltersChange = (filtered: Task[]) => {
    setFilteredTasks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="w-full">
      <TaskFilters 
        tasks={tasks} 
        onFiltersChange={handleFiltersChange}
      />
      
      <TaskGrid 
        tasks={currentTasks} 
        onTaskUpdate={handleTaskUpdate}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalTasks={filteredTasks.length}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};

export default TaskList;
