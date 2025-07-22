
import { useState } from "react";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useTaskActions = (
  task: Task, 
  onTaskUpdate: (updatedTask: Task) => void,
  onTaskDelete?: (taskId: string) => void
) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (editedTaskData: Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">) => {
    // Make sure we have a week date
    if (!editedTaskData.weekStartDate) {
      toast({
        title: "Data da semana requerida",
        description: "Por favor, selecione a data de início da semana (segunda-feira).",
        variant: "destructive",
      });
      return;
    }
    
    // Create updated dailyStatus array that includes all planned days
    const updatedDailyStatus = [...task.dailyStatus];
    
    // For each planned day in the edited data, ensure it has a status
    editedTaskData.plannedDays.forEach(plannedDay => {
      const existingStatus = updatedDailyStatus.find(status => status.day === plannedDay);
      
      // If this day doesn't have a status yet, add it as "planned"
      if (!existingStatus) {
        updatedDailyStatus.push({
          day: plannedDay,
          status: "planned"
        });
      }
    });
    
    // Remove statuses for days that are no longer planned
    const filteredDailyStatus = updatedDailyStatus.filter(status => 
      editedTaskData.plannedDays.includes(status.day)
    );
    
    const updatedTask: Task = {
      ...task,
      ...editedTaskData,
      dailyStatus: filteredDailyStatus,
    };

    onTaskUpdate(updatedTask);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = () => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
      setIsDeleteDialogOpen(false);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    }
  };

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleSaveEdit,
    handleDelete
  };
};
