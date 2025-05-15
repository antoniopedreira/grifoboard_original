
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
          <Button variant="outline" size="sm" className="text-xs text-left justify-between text-gray-700 border-gray-200">
            {currentCause || "Causas Padrão"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[200px] overflow-y-auto bg-white">
          {standardCauses.map(cause => (
            <DropdownMenuItem 
              key={cause} 
              onClick={() => onCauseSelect(cause)}
              className="text-gray-800 hover:bg-gray-50"
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
