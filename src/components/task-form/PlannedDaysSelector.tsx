
import { DayOfWeek } from "@/types";
import { dayNameMap } from "@/utils/pcp";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlannedDaysSelectorProps {
  plannedDays: DayOfWeek[];
  setPlannedDays: (days: DayOfWeek[]) => void;
}

const PlannedDaysSelector: React.FC<PlannedDaysSelectorProps> = ({ 
  plannedDays, 
  setPlannedDays 
}) => {
  const handleDayToggle = (day: DayOfWeek) => {
    // Corrected type handling to ensure we return DayOfWeek[] explicitly
    setPlannedDays(
      plannedDays.includes(day)
        ? plannedDays.filter(d => d !== day)
        : [...plannedDays, day]
    );
  };

  return (
    <div className="space-y-3 w-full">
      <Label className="font-medium">Dias Planejados</Label>
      
      {/* Using ScrollArea for mobile responsiveness if needed */}
      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-2 sm:gap-4 py-2">
          {(Object.entries(dayNameMap) as [DayOfWeek, string][]).map(([day, name]) => (
            <div 
              key={day} 
              className="flex items-center min-w-[70px] pl-2 pr-3 py-1.5 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => handleDayToggle(day as DayOfWeek)}
            >
              <Checkbox
                id={`day-${day}`}
                checked={plannedDays.includes(day as DayOfWeek)}
                onCheckedChange={() => handleDayToggle(day as DayOfWeek)}
                className="mr-2"
              />
              <Label htmlFor={`day-${day}`} className="cursor-pointer text-sm">{name}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlannedDaysSelector;
