
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
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
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
