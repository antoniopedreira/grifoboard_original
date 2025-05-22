
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
import { ChevronDown } from "lucide-react";

interface CausesDropdownProps {
  onCauseSelect: (cause: string) => void;
  currentCause: string | undefined;
}

const CausesDropdown: React.FC<CausesDropdownProps> = ({ onCauseSelect, currentCause }) => {
  // Function to truncate text and add ellipsis if needed
  const renderCauseText = () => {
    if (!currentCause) return "Causas Padrão";
    
    return currentCause.length > 16 
      ? <span className="truncate block max-w-full">{currentCause.substring(0, 16)}...</span>
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
                    className="text-xs text-left justify-between text-gray-700 border-gray-200 w-full truncate h-6 px-2 rounded-md flex items-center shadow-sm hover:shadow"
                  >
                    {renderCauseText()}
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[200px] overflow-y-auto bg-white rounded-lg shadow-md border border-gray-200">
                  {standardCauses.map(cause => (
                    <DropdownMenuItem 
                      key={cause} 
                      onClick={() => onCauseSelect(cause)}
                      className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {cause}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{currentCause || "Causas Padrão"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CausesDropdown;
