
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import TaskDetails from "./task/TaskDetails";
import TaskStatusDisplay from "./task/TaskStatusDisplay";
import { useToast } from "@/hooks/use-toast";
import TaskHeader from "./task-card/TaskHeader";
import TaskFooter from "./task-card/TaskFooter";
import EditTaskDialog from "./task-card/EditTaskDialog";
import DeleteConfirmDialog from "./task-card/DeleteConfirmDialog";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate, onTaskDelete }) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState<Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">>(
    {
      sector: task.sector,
      item: task.item,
      description: task.description,
      discipline: task.discipline,
      team: task.team,
      responsible: task.responsible,
      executor: task.executor || "",
      cable: task.cable || "",
      plannedDays: task.plannedDays,
      causeIfNotDone: task.causeIfNotDone,
    }
  );

  const handleStatusChange = (day: DayOfWeek, newStatus: TaskStatus) => {
    const updatedDailyStatus = task.dailyStatus.map(status => 
      status.day === day ? { ...status, status: newStatus } : status
    );

    onTaskUpdate({
      ...task,
      dailyStatus: updatedDailyStatus,
    });
  };

  const handleCompletionStatusChange = () => {
    onTaskUpdate({
      ...task,
      isFullyCompleted: !task.isFullyCompleted,
    });
  };

  const handleCauseSelect = (cause: string) => {
    onTaskUpdate({
      ...task,
      causeIfNotDone: cause
    });
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setEditFormData(prev => {
      const updatedPlannedDays = prev.plannedDays.includes(day)
        ? prev.plannedDays.filter(d => d !== day)
        : [...prev.plannedDays, day];
      
      return {
        ...prev,
        plannedDays: updatedPlannedDays
      };
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    const updatedTask: Task = {
      ...task,
      ...editFormData,
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

  const isFormValid = () => {
    return (
      editFormData.sector?.trim() !== "" &&
      editFormData.description?.trim() !== "" &&
      editFormData.responsible?.trim() !== "" &&
      editFormData.plannedDays.length > 0
    );
  };

  return (
    <>
      <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <TaskHeader 
            task={task} 
            onCompletionStatusChange={handleCompletionStatusChange} 
          />
        </CardHeader>
        
        <CardContent className="pb-2">
          <TaskDetails 
            sector={task.sector}
            discipline={task.discipline}
            team={task.team}
            responsible={task.responsible}
            executor={task.executor || "Não definido"}
            cable={task.cable || "Não definido"}
          />
          
          <TaskStatusDisplay 
            task={task}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
        
        <CardFooter className="pt-2">
          <TaskFooter 
            isCompleted={task.isFullyCompleted}
            currentCause={task.causeIfNotDone}
            onCauseSelect={handleCauseSelect}
            onEditClick={handleEditClick}
          />
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <EditTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        editFormData={editFormData}
        onEditFormChange={handleEditFormChange}
        onDayToggle={handleDayToggle}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onSave={handleSaveEdit}
        isFormValid={isFormValid}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default TaskCard;
