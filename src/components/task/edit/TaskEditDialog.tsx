
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import TaskFormFields from "./TaskFormFields";
import { useTaskEdit } from "./useTaskEdit";

interface TaskEditDialogProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  isOpen,
  onOpenChange,
  onTaskUpdate
}) => {
  const { 
    updateField, 
    handleSubmit, 
    isFormValid 
  } = useTaskEdit(task, onTaskUpdate, () => onOpenChange(false));

  const handleFieldsChange = (fields: Partial<Task>) => {
    // Update each field in the useTaskEdit hook
    Object.entries(fields).forEach(([field, value]) => {
      updateField(field, value);
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <TaskFormFields 
          task={task} 
          onFieldsChange={handleFieldsChange} 
        />
        
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
