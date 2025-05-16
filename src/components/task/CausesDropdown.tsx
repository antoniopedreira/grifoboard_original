
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { standardCauses } from "@/utils/standardCauses";

interface CausesDropdownProps {
  onCauseSelect: (cause: string) => void;
  currentCause: string | undefined;
}

const CausesDropdown: React.FC<CausesDropdownProps> = ({ onCauseSelect, currentCause }) => {
  // Function to truncate text and add ellipsis if needed
  const renderCauseText = () => {
    if (!currentCause) return "Causas Padrão";
    
    return (
      <span className="truncate block">{currentCause}</span>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs text-left justify-between text-gray-700 border-gray-200 w-full truncate"
                  >
                    {renderCauseText()}
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
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {currentCause || "Causas Padrão"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
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
