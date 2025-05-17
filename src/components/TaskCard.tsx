
import React from "react";
import { Task, DayOfWeek, TaskStatus } from "@/types";
import { motion } from "framer-motion";
import { useTaskStatus } from "@/components/task-card/useTaskStatus";
import { useTaskActions } from "@/components/task-card/useTaskActions";
import TaskHeader from "@/components/task-card/TaskHeader";
import TaskStatusDisplay from "@/components/task/TaskStatusDisplay";
import TaskFooter from "@/components/task-card/TaskFooter";
import EditTaskDialog from "@/components/task-card/EditTaskDialog";
import DeleteConfirmDialog from "@/components/task-card/DeleteConfirmDialog";
import { useTaskEditForm } from "@/components/task-card/useTaskEditForm";
import { GlassCard } from "./ui/glass-card";

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
  onTaskDuplicate,
}) => {
  // Custom hooks for task operations
  const { handleStatusChange, handleCompletionStatusChange, handleCauseSelect } = useTaskStatus(task, onTaskUpdate);
  
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEditClick,
    handleSaveEdit,
    handleDelete,
  } = useTaskActions(task, onTaskUpdate, onTaskDelete);
  
  const {
    editFormData,
    handleDayToggle,
    handleEditFormChange,
    handleWeekDateChange,
    isFormValid,
  } = useTaskEditForm(task);
  
  // Handle duplicate click
  const handleDuplicateClick = () => {
    if (onTaskDuplicate) {
      onTaskDuplicate(task);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      className="h-full"
    >
      <GlassCard 
        className={`flex flex-col h-full ${
          task.isFullyCompleted 
            ? "shadow-[0_0_15px_rgba(139,112,50,0.2)]" 
            : ""
        }`}
      >
        <div className="flex-1">
          <TaskHeader 
            task={task} 
            onCompletionStatusChange={handleCompletionStatusChange} 
          />
          
          <div className="mt-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Setor: {task.sector}</span>
              <span className="text-xs text-muted-foreground">Equipe: {task.team}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">Resp: {task.responsible}</span>
              <span className="text-xs text-muted-foreground">{task.discipline}</span>
            </div>
          </div>
          
          <TaskStatusDisplay task={task} onStatusChange={handleStatusChange} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <TaskFooter
            isCompleted={task.isFullyCompleted}
            currentCause={task.causeIfNotDone || ""}
            onCauseSelect={handleCauseSelect}
            onEditClick={handleEditClick}
            onDuplicateClick={handleDuplicateClick}
          />
        </div>
      </GlassCard>
      
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
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default TaskCard;
