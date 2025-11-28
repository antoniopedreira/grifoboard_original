
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegistryForm from "./RegistryForm";
import { useRegistry } from "@/context/RegistryContext";

interface RegistryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RegistryDialog: React.FC<RegistryDialogProps> = ({ isOpen, onOpenChange }) => {
  const { addRegistry, isSaving } = useRegistry();

  const handleRegistryCreate = async (type: string, value: string) => {
    await addRegistry(type, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const isClickOutside = e.type === 'pointerdown';
          if (!isClickOutside) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">Cadastros</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <RegistryForm 
            onClose={() => onOpenChange(false)} 
            onRegistryCreate={handleRegistryCreate}
            isSaving={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistryDialog;
