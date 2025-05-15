
import { DayOfWeek } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarIcon } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

interface EditTaskFormProps {
  editFormData: any;
  onEditFormChange: (field: string, value: string) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: () => boolean;
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
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();

  // Ensure we have valid data to work with
  const safeEditFormData = {
    sector: editFormData?.sector || "",
    description: editFormData?.description || "",
    discipline: editFormData?.discipline || "",
    team: editFormData?.team || "",
    responsible: editFormData?.responsible || "",
    executor: editFormData?.executor || "",
    cable: editFormData?.cable || "",
    plannedDays: editFormData?.plannedDays || [],
    weekStartDate: editFormData?.weekStartDate
  };

  return (
    <div className="grid gap-5 py-4 max-h-[70vh] overflow-y-auto px-1">
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
        <Label htmlFor="edit-weekStartDate" className="font-medium">Semana (Segunda-feira)</Label>
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
        <p className="text-sm text-muted-foreground">
          A tarefa será exibida apenas na semana selecionada.
        </p>
      </div>

      {/* Two columns layout for sector and cable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Setor */}
        <div className="space-y-2">
          <Label htmlFor="edit-sector" className="font-medium">Setor</Label>
          <Select 
            value={safeEditFormData.sector} 
            onValueChange={(value) => onEditFormChange("sector", value)}
          >
            <SelectTrigger id="edit-sector">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {sectors.length > 0 ? (
                sectors.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhum setor cadastrado</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {/* Cabo */}
        <div className="space-y-2">
          <Label htmlFor="edit-cable" className="font-medium">Cabo</Label>
          <Select 
            value={safeEditFormData.cable} 
            onValueChange={(value) => onEditFormChange("cable", value)}
          >
            <SelectTrigger id="edit-cable">
              <SelectValue placeholder="Selecione o cabo" />
            </SelectTrigger>
            <SelectContent>
              {cables.length > 0 ? (
                cables.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhum cabo cadastrado</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Two columns layout for discipline and team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-discipline" className="font-medium">Disciplina</Label>
          <Select 
            value={safeEditFormData.discipline} 
            onValueChange={(value) => onEditFormChange("discipline", value)}
          >
            <SelectTrigger id="edit-discipline">
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              {disciplines.length > 0 ? (
                disciplines.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhuma disciplina cadastrada</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-team" className="font-medium">Equipe</Label>
          <Select 
            value={safeEditFormData.team} 
            onValueChange={(value) => onEditFormChange("team", value)}
          >
            <SelectTrigger id="edit-team">
              <SelectValue placeholder="Selecione a equipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.length > 0 ? (
                teams.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhuma equipe cadastrada</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Two columns layout for responsible and executor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-responsible" className="font-medium">Responsável</Label>
          <Select 
            value={safeEditFormData.responsible} 
            onValueChange={(value) => onEditFormChange("responsible", value)}
          >
            <SelectTrigger id="edit-responsible">
              <SelectValue placeholder="Selecione o responsável" />
            </SelectTrigger>
            <SelectContent>
              {responsibles.length > 0 ? (
                responsibles.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhum responsável cadastrado</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-executor" className="font-medium">Executante</Label>
          <Select 
            value={safeEditFormData.executor} 
            onValueChange={(value) => onEditFormChange("executor", value)}
          >
            <SelectTrigger id="edit-executor">
              <SelectValue placeholder="Selecione o executante" />
            </SelectTrigger>
            <SelectContent>
              {executors.length > 0 ? (
                executors.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  <p>Nenhum executante cadastrado</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Planned days - centered */}
      <div className="space-y-3 w-full">
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

      <div className="flex justify-between pt-5 sticky bottom-0 bg-background">
        <Button 
          variant="destructive" 
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Excluir
        </Button>
        <Button onClick={onSave} disabled={!isFormValid()}>
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default EditTaskForm;
