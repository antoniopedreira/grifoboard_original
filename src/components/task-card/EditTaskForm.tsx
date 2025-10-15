import { DayOfWeek } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarIcon } from "lucide-react";
import { dayNameMap, getWeekStartDate } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import SearchableSelect from "@/components/task-form/SearchableSelect";

interface EditTaskFormProps {
  editFormData: any;
  onEditFormChange: (field: string, value: string) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: boolean | (() => boolean);  // Updated to accept either boolean or function returning boolean
  task: any;
  onWeekDateChange: (date: Date) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  editFormData,
  onEditFormChange,
  onDayToggle,
  onDelete,
  onSave,
  isFormValid,
  onWeekDateChange
}) => {
  const { sectors, disciplines, teams, responsibles, executors } = useRegistry();

  // Sort all registry arrays alphabetically
  const sortedSectors = [...sectors].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  const sortedDisciplines = [...disciplines].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  const sortedTeams = [...teams].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  const sortedResponsibles = [...responsibles].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  const sortedExecutors = [...executors].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  

  // Helper function to evaluate isFormValid regardless of type
  const checkFormValidity = () => {
    return typeof isFormValid === 'function' ? isFormValid() : isFormValid;
  };

  // Ensure we have valid data to work with
  const safeEditFormData = {
    sector: editFormData?.sector || "",
    description: editFormData?.description || "",
    discipline: editFormData?.discipline || "",
    team: editFormData?.team || "",
    responsible: editFormData?.responsible || "",
    executor: editFormData?.executor || "",
    
    plannedDays: editFormData?.plannedDays || [],
    weekStartDate: editFormData?.weekStartDate
  };

  return (
    <>
      <div className="overflow-y-auto scrollbar-thin p-6 pt-4 max-h-[calc(90vh-200px)] pr-4">
        <div className="grid gap-5 py-2 pb-6">
          {/* Description - first position */}
          <div className="space-y-2 w-full">
            <Label htmlFor="edit-description" className="font-medium">Descrição</Label>
            <Input
              id="edit-description"
              value={safeEditFormData.description}
              onChange={(e) => onEditFormChange("description", e.target.value)}
              placeholder="Descrição da tarefa"
            />
          </div>

          {/* Week start date picker - full width */}
          <div className="space-y-2 w-full">
            <Label htmlFor="edit-weekStartDate" className="font-medium">Semana</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="edit-weekStartDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !safeEditFormData.weekStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {safeEditFormData.weekStartDate ? 
                    format(safeEditFormData.weekStartDate, "dd/MM/yyyy") : 
                    <span>Selecionar data</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={safeEditFormData.weekStartDate}
                  onSelect={(date) => {
                    // Force selection to be Monday by finding the Monday of the selected date's week
                    if (date) {
                      const mondayDate = getWeekStartDate(date);
                      onWeekDateChange(mondayDate);
                    }
                  }}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Two columns layout for sector and discipline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              id="edit-sector"
              label="Setor"
              value={safeEditFormData.sector}
              onValueChange={(value) => onEditFormChange("sector", value)}
              options={sortedSectors}
              placeholder="Selecione o setor"
            />
            
            <SearchableSelect
              id="edit-discipline"
              label="Disciplina"
              value={safeEditFormData.discipline}
              onValueChange={(value) => onEditFormChange("discipline", value)}
              options={sortedDisciplines}
              placeholder="Selecione a disciplina"
            />
          </div>
          
          {/* Single column layout for executante */}
          <div className="grid grid-cols-1 gap-4">
            <SearchableSelect
              id="edit-team"
              label="Executante"
              value={safeEditFormData.team}
              onValueChange={(value) => onEditFormChange("team", value)}
              options={sortedTeams}
              placeholder="Selecione o executante"
            />
          </div>
          
          {/* Two columns layout for responsible and executor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              id="edit-responsible"
              label="Responsável"
              value={safeEditFormData.responsible}
              onValueChange={(value) => onEditFormChange("responsible", value)}
              options={sortedResponsibles}
              placeholder="Selecione o responsável"
            />
            
            <SearchableSelect
              id="edit-executor"
              label="Encarregado"
              value={safeEditFormData.executor}
              onValueChange={(value) => onEditFormChange("executor", value)}
              options={sortedExecutors}
              placeholder="Selecione o encarregado"
            />
          </div>
          
          {/* Planned days - centered with extra bottom margin */}
          <div className="space-y-3 w-full mb-8">
            <Label className="font-medium">Dias Planejados</Label>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {(Object.entries(dayNameMap) as [DayOfWeek, string][]).map(([day, name]) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-day-${day}`}
                    checked={safeEditFormData.plannedDays.includes(day as DayOfWeek)}
                    onCheckedChange={() => onDayToggle(day as DayOfWeek)}
                  />
                  <Label htmlFor={`edit-day-${day}`} className="cursor-pointer">{name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed footer with buttons */}
      <div className="flex justify-between p-6 sticky bottom-0 bg-background border-t">
        <Button 
          variant="destructive" 
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
        <Button onClick={onSave} disabled={!checkFormValidity()}>
          Salvar Alterações
        </Button>
      </div>
    </>
  );
};

export default EditTaskForm;
