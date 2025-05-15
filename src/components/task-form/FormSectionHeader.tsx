
import { Label } from "@/components/ui/label";

interface FormSectionHeaderProps {
  label: string;
  description?: string;
}

const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({ 
  label, 
  description 
}) => {
  return (
    <div className="space-y-2 w-full">
      <Label className="font-medium">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

export default FormSectionHeader;
