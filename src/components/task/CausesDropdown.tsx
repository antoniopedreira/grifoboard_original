
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { standardCauses } from "@/utils/standardCauses";

interface CausesDropdownProps {
  onCauseSelect: (cause: string) => void;
  currentCause: string | undefined;
}

const CausesDropdown: React.FC<CausesDropdownProps> = ({ onCauseSelect, currentCause }) => {
  return (
    <div className="flex flex-col gap-2 flex-grow">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs text-left justify-between">
            {currentCause || "Causas Padrão"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[200px] overflow-y-auto">
          {standardCauses.map(cause => (
            <DropdownMenuItem 
              key={cause} 
              onClick={() => onCauseSelect(cause)}
            >
              {cause}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentCause && (
        <div className="text-xs text-red-500 hidden">
          <span className="font-semibold">Causa: </span>
          <span>{currentCause}</span>
        </div>
      )}
    </div>
  );
};

export default CausesDropdown;
