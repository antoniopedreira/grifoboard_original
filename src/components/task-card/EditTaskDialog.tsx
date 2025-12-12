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
  const { editFormData, handleEditFormChange, handleDayToggle, handleSave, isFormValid, handleWeekDateChange } =
    useTaskEditForm(task, (updatedTask) => {
      onUpdate(updatedTask);
      onOpenChange(false);
    });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        // CORREÇÃO: 'flex flex-col' garante que o layout ocupe a altura corretamente
        className="sm:max-w-[600px] p-0 max-h-[90vh] flex flex-col bg-white overflow-hidden"
      >
        {/* Header Fixo */}
        <div className="flex-none sticky top-0 bg-white z-10 p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-50 p-2 rounded-full mr-3">
                <Edit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-heading font-bold text-primary">Editar Tarefa</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Atualize as informações e o planejamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corpo Flexível (O Form agora vai rolar aqui dentro) */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <EditTaskForm
            task={task}
            editFormData={editFormData}
            onEditFormChange={handleEditFormChange}
            onDayToggle={handleDayToggle}
            onDelete={() => {}}
            onSave={handleSave}
            isFormValid={isFormValid}
            onWeekDateChange={handleWeekDateChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
