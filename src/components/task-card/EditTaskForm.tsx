
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { dayNameMap, getWeekStartDate } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";
import { cn } from "@/lib/utils";

interface EditTaskFormProps {
  editFormData: any;
  onEditFormChange: (field: string, value: string | Date) => void;
  onDayToggle: (day: DayOfWeek) => void;
  onDelete: () => void;
  onSave: () => void;
  isFormValid: () => boolean;
  task: any;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  editFormData,
  onEditFormChange,
  onDayToggle,
  onDelete,
  onSave,
  isFormValid
}) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();

  // Handle date selection and ensure it's the start of a week (Monday)
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const weekStart = getWeekStartDate(date);
      onEditFormChange("weekStartDate", weekStart);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-week-start-date">Semana</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="edit-week-start-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !editFormData.weekStartDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {editFormData.weekStartDate ? format(new Date(editFormData.weekStartDate), "dd/MM/yyyy") : <span>Selecione a data inicial da semana</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={editFormData.weekStartDate ? new Date(editFormData.weekStartDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Sempre será ajustado para o início da semana (segunda-feira)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-sector">Setor</Label>
        <Select 
          value={editFormData.sector} 
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
      
      <div className="space-y-2">
        <Label htmlFor="edit-description">Descrição</Label>
        <Input
          id="edit-description"
          value={editFormData.description}
          onChange={(e) => onEditFormChange("description", e.target.value)}
          placeholder="Descrição da tarefa"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-discipline">Disciplina</Label>
          <Select 
            value={editFormData.discipline} 
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
          <Label htmlFor="edit-team">Equipe</Label>
          <Select 
            value={editFormData.team} 
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-responsible">Responsável</Label>
          <Select 
            value={editFormData.responsible} 
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
          <Label htmlFor="edit-executor">Executante</Label>
          <Select 
            value={editFormData.executor || ""} 
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
      
      <div className="space-y-2">
        <Label htmlFor="edit-cable">Cabo</Label>
        <Select 
          value={editFormData.cable || ""} 
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
      
      <div className="space-y-2">
        <Label>Dias Planejados</Label>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(dayNameMap) as [DayOfWeek, string][]).map(([day, name]) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`edit-day-${day}`}
                checked={editFormData.plannedDays.includes(day as DayOfWeek)}
                onCheckedChange={() => onDayToggle(day as DayOfWeek)}
              />
              <Label htmlFor={`edit-day-${day}`} className="cursor-pointer">{name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-3">
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
