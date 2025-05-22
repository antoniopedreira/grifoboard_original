
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
    
    return currentCause.length > 18 
      ? <span className="truncate block max-w-full">{currentCause.substring(0, 18)}...</span>
      : <span className="truncate block max-w-full">{currentCause}</span>;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs text-left justify-between text-gray-700 border-gray-200 w-full truncate h-6 px-2"
                  >
                    {renderCauseText()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[200px] overflow-y-auto bg-white">
                  {standardCauses.map(cause => (
                    <DropdownMenuItem 
                      key={cause} 
                      onClick={() => onCauseSelect(cause)}
                      className="text-xs text-gray-800 hover:bg-gray-50"
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
    </div>
  );
};

export default CausesDropdown;
