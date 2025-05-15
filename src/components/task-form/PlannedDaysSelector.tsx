
import { DayOfWeek } from "@/types";
import { dayNameMap } from "@/utils/pcp";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {(Object.entries(dayNameMap) as [DayOfWeek, string][]).map(([day, name]) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day}`}
              checked={plannedDays.includes(day as DayOfWeek)}
              onCheckedChange={() => handleDayToggle(day as DayOfWeek)}
            />
            <Label htmlFor={`day-${day}`} className="cursor-pointer">{name}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannedDaysSelector;
