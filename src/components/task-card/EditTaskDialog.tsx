
import { Task, DayOfWeek } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import EditTaskForm from "./EditTaskForm";

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
  isFormValid
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <EditTaskForm
          task={task}
          editFormData={editFormData}
          onEditFormChange={onEditFormChange}
          onDayToggle={onDayToggle}
          onDelete={onDelete}
          onSave={onSave}
          isFormValid={isFormValid}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
