
import { Task, DayOfWeek } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import EditTaskForm from "./EditTaskForm";
import { X } from "lucide-react";

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  editFormData: Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">;
  onEditFormChange: (field: string, value: string) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: () => boolean;
  onWeekDateChange: (date: Date) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  task,
  editFormData,
  onEditFormChange,
  onDayToggle,
  onDelete,
  onSave,
  isFormValid,
  onWeekDateChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Editar Tarefa</DialogTitle>
            <DialogClose className="rounded-full hover:bg-muted w-7 h-7 flex items-center justify-center focus:outline-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <EditTaskForm
          task={task}
          editFormData={editFormData}
          onEditFormChange={onEditFormChange}
          onDayToggle={onDayToggle}
          onDelete={onDelete}
          onSave={onSave}
          isFormValid={isFormValid}
          onWeekDateChange={onWeekDateChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
