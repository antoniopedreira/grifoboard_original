
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types";
import TaskDetails from "./task/TaskDetails";
import TaskStatusDisplay from "./task/TaskStatusDisplay";
import TaskHeader from "./task-card/TaskHeader";
import TaskFooter from "./task-card/TaskFooter";
import EditTaskDialog from "./task-card/EditTaskDialog";
import DeleteConfirmDialog from "./task-card/DeleteConfirmDialog";
import { useTaskStatus } from "./task-card/useTaskStatus";
import { useTaskActions } from "./task-card/useTaskActions";
import { useTaskEditForm } from "./task-card/useTaskEditForm";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onTaskUpdate, 
  onTaskDelete,
  onTaskDuplicate 
}) => {
  // Use custom hooks to manage task state and actions
  const { 
    handleStatusChange, 
    handleCompletionStatusChange, 
    handleCauseSelect 
  } = useTaskStatus(task, onTaskUpdate);
  
  const { 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    handleEditClick, 
    handleSaveEdit, 
    handleDelete 
  } = useTaskActions(task, onTaskUpdate, onTaskDelete);
  
  const { 
    editFormData, 
    handleDayToggle, 
    handleEditFormChange, 
    handleWeekDateChange, 
    isFormValid 
  } = useTaskEditForm(task);

  return (
    <>
      <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow text-sm">
        <CardHeader className="pb-1 pt-3 px-3">
          <TaskHeader 
            task={task} 
            onCompletionStatusChange={handleCompletionStatusChange} 
          />
        </CardHeader>
        
        <CardContent className="px-3 pb-1">
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
        
        <CardFooter className="px-3 pt-1 pb-3">
          <TaskFooter 
            isCompleted={task.isFullyCompleted}
            currentCause={task.causeIfNotDone}
            onCauseSelect={handleCauseSelect}
            onEditClick={handleEditClick}
            onDuplicateClick={() => onTaskDuplicate?.(task)}
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
        onSave={() => handleSaveEdit(editFormData)}
        isFormValid={isFormValid}
        onWeekDateChange={handleWeekDateChange}
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
