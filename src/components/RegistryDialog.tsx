
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
        className="sm:max-w-[650px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Only allow closing when clicking outside, not on focus loss
          const isClickOutside = e.type === 'pointerdown';
          if (!isClickOutside) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Cadastros</DialogTitle>
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
