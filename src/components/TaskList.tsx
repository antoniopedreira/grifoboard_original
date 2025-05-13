
import { useState } from "react";
import { Task } from "@/types";
import TaskFilters from "./task/TaskFilters";
import TaskGrid from "./task/TaskGrid";
import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const { toast } = useToast();
  
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

  return (
    <div className="w-full">
      <TaskFilters 
        tasks={tasks} 
        onFiltersChange={setFilteredTasks} 
      />
      
      <TaskGrid 
        tasks={filteredTasks} 
        onTaskUpdate={handleTaskUpdate} 
      />
    </div>
  );
};

export default TaskList;
