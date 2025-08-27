
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
import { useSearchParams } from "react-router-dom";
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
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
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

  // Route-driven edit modal state
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isRouteOpen = editId === task.id;

  const openEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.set("edit", task.id);
    setSearchParams(next, { replace: true });
  };
  const closeEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
  };
  const handleOpenChange = (open: boolean) => {
    if (open) openEdit(); else closeEdit();
  };
  const handleSaveAndClose = () => {
    handleSaveEdit(editFormData);
    closeEdit();
  };
  const handleDeleteAndClose = () => {
    handleDelete();
    closeEdit();
  };

  return (
    <>
      <Card className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-full border border-gray-100/60 overflow-hidden hover:-translate-y-1">
        <CardHeader className="pb-2 pt-4 px-4" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>
          <TaskHeader 
            task={task} 
            onCompletionStatusChange={handleCompletionStatusChange} 
          />
        </CardHeader>
        
        <CardContent className="px-4 pb-2" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>
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
        
        <CardFooter className="px-4 pt-1 pb-4" style={{ overflow: 'hidden', whiteSpace: 'normal', wordWrap: 'break-word' }}>
          <TaskFooter 
            isCompleted={task.isFullyCompleted}
            currentCause={task.causeIfNotDone}
            onCauseSelect={handleCauseSelect}
            onEditClick={openEdit}
            onDuplicateClick={() => onTaskDuplicate?.(task)}
            onCauseRemove={task.causeIfNotDone ? () => handleCauseSelect("") : undefined}
          />
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <EditTaskDialog
        isOpen={isRouteOpen}
        onOpenChange={handleOpenChange}
        task={task}
        editFormData={editFormData}
        onEditFormChange={handleEditFormChange}
        onDayToggle={handleDayToggle}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onSave={handleSaveAndClose}
        isFormValid={isFormValid}
        onWeekDateChange={handleWeekDateChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteAndClose}
      />
    </>
  );
};

export default TaskCard;
