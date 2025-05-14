
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Cadastros</DialogTitle>
        </DialogHeader>
        <RegistryForm 
          onClose={() => onOpenChange(false)} 
          onRegistryCreate={handleRegistryCreate}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RegistryDialog;
