
import { useCallback } from "react";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { tarefasService } from "@/services/tarefaService";
import { convertTaskToTarefa } from "@/utils/taskConversion";

export const useTaskOperations = (
  tasks: Task[],
  updateTasksState: (updatedTasks: Task[]) => void
) => {
  const { toast } = useToast();

  // Function to update a task
  const handleTaskUpdate = useCallback(async (updatedTask: Task) => {
    try {
      // Convert Task to Tarefa
      const tarefaToUpdate = convertTaskToTarefa(updatedTask);
      
      await tarefasService.atualizarTarefa(updatedTask.id, tarefaToUpdate);
      
      // Update task locally
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      updateTasksState(updatedTasks);
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
      
      return updatedTask;
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [tasks, toast, updateTasksState]);
  
  // Function to delete a task
  const handleTaskDelete = useCallback(async (taskId: string) => {
    try {
      await tarefasService.excluirTarefa(taskId);
      
      // Remove task locally
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      updateTasksState(updatedTasks);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [tasks, toast, updateTasksState]);

  return {
    handleTaskUpdate,
    handleTaskDelete
  };
};
