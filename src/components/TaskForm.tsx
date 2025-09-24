
import { Task } from "@/types";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import TaskFormHeader from "./task-form/TaskFormHeader";
import TaskFormContent from "./task-form/TaskFormContent";

interface TaskFormProps {
  onTaskCreate: (task: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeekStartDate?: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onTaskCreate,
  isOpen,
  onOpenChange,
  currentWeekStartDate
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[95vw] max-w-[600px] p-0 max-h-[90vh] overflow-hidden mx-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Only allow closing when clicking outside, not on focus loss
          const isClickOutside = e.type === 'pointerdown';
          if (!isClickOutside) {
            e.preventDefault();
          }
        }}
      >
        <TaskFormHeader />
        <TaskFormContent
          onTaskCreate={onTaskCreate}
          onOpenChange={onOpenChange}
          currentWeekStartDate={currentWeekStartDate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
