import { Task } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditTaskForm from "./EditTaskForm";
import { Edit } from "lucide-react";
import { useTaskEditForm } from "./useTaskEditForm";

export interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({ isOpen, onOpenChange, task, onUpdate }) => {
  // Agora o hook aceita o callback como segundo argumento
  const { editFormData, handleEditFormChange, handleDayToggle, handleSave, isFormValid, handleWeekDateChange } =
    useTaskEditForm(task, (updatedTask) => {
      onUpdate(updatedTask);
      onOpenChange(false);
    });

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
          onEditFormChange={handleEditFormChange}
          onDayToggle={handleDayToggle}
          onDelete={() => {}} // Delete é gerenciado pelo TaskCard, passamos vazio aqui
          onSave={handleSave}
          isFormValid={isFormValid}
          onWeekDateChange={handleWeekDateChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
