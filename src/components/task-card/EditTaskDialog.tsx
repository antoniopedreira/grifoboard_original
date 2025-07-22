
import { Task, DayOfWeek } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import EditTaskForm from "./EditTaskForm";
import { Edit, X } from "lucide-react";

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  editFormData: Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">;
  onEditFormChange: (field: string, value: string) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: boolean | (() => boolean);
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
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-background z-10 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-50 p-1 rounded-full mr-3">
                <Edit className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-xl font-semibold">Editar Tarefa</DialogTitle>
            </div>
          </div>
        </div>
        
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
