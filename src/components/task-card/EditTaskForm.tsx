
import { DayOfWeek } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { dayNameMap } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";

interface EditTaskFormProps {
  editFormData: any;
  onEditFormChange: (field: string, value: string) => void;
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

  return (
    <div className="grid gap-4 py-4">
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
            {sectors.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
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
              {disciplines.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
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
              {teams.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
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
              {responsibles.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
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
              {executors.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
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
            {cables.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
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
