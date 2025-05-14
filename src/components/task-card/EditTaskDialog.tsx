
import { Task, DayOfWeek } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Editar Tarefa</DialogTitle>
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
