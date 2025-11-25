
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Task } from "@/types";
import TaskDetails from "./task/TaskDetails";
import TaskStatusDisplay from "./task/TaskStatusDisplay";
import TaskHeader from "./task-card/TaskHeader";
import TaskFooter from "./task-card/TaskFooter";
import EditTaskDialog from "./task-card/EditTaskDialog";
import DeleteConfirmDialog from "./task-card/DeleteConfirmDialog";
import MaterialsSection from "./materials/MaterialsSection";
import { useTaskStatus } from "./task-card/useTaskStatus";
import { useTaskActions } from "./task-card/useTaskActions";
import { useTaskEditForm } from "./task-card/useTaskEditForm";
import { useSearchParams } from "react-router-dom";
interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (task: Task) => void;
  onCopyToNextWeek?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onTaskUpdate, 
  onTaskDelete,
  onTaskDuplicate,
  onCopyToNextWeek 
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
      <Card className="w-full bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100/60 overflow-hidden flex flex-col transition-transform duration-200 motion-reduce:transition-none min-h-[280px]">
        <CardHeader className="pb-3 pt-4 px-4 flex-shrink-0">
          <TaskHeader 
            task={task} 
            onCompletionStatusChange={handleCompletionStatusChange} 
          />
        </CardHeader>
        
        <CardContent className="px-4 pb-3 flex-1 flex flex-col">
          <TaskDetails 
            sector={task.sector}
            discipline={task.discipline}
            team={task.team}
            responsible={task.responsible}
            executor={task.executor || "Não definido"}
          />
          
          <TaskStatusDisplay 
            task={task}
            onStatusChange={handleStatusChange}
          />
          
          {!task.isFullyCompleted && (
            <MaterialsSection tarefaId={task.id} />
          )}
        </CardContent>
        
        <CardFooter className="px-4 pt-2 pb-4 flex-shrink-0 mt-auto">
          <TaskFooter 
            isCompleted={task.isFullyCompleted}
            currentCause={task.causeIfNotDone}
            onCauseSelect={handleCauseSelect}
            onEditClick={openEdit}
            onDuplicateClick={() => onTaskDuplicate?.(task)}
            onCopyToNextWeek={() => onCopyToNextWeek?.(task)}
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

export default React.memo(TaskCard);
