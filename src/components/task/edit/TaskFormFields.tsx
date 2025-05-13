
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DayOfWeek, Task } from "@/types";
import { dayNameMap } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";

interface TaskFormFieldsProps {
  task: Task;
  onFieldsChange: (fields: Partial<Task>) => void;
}

const TaskFormFields: React.FC<TaskFormFieldsProps> = ({ task, onFieldsChange }) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();
  
  const [sector, setSector] = useState(task.sector);
  const [description, setDescription] = useState(task.description);
  const [discipline, setDiscipline] = useState(task.discipline);
  const [team, setTeam] = useState(task.team);
  const [responsible, setResponsible] = useState(task.responsible);
  const [executor, setExecutor] = useState(task.executor || "");
  const [cable, setCable] = useState(task.cable || "");
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>(task.plannedDays);
  
  // Update parent component whenever a field changes
  const updateFields = (field: string, value: string | DayOfWeek[]) => {
    const updatedFields = { [field]: value };
    onFieldsChange(updatedFields);
    
    // Update local state based on field
    switch (field) {
      case 'sector': 
        setSector(value as string);
        break;
      case 'description':
        setDescription(value as string);
        break;
      case 'discipline':
        setDiscipline(value as string);
        break;
      case 'team':
        setTeam(value as string);
        break;
      case 'responsible':
        setResponsible(value as string);
        break;
      case 'executor':
        setExecutor(value as string);
        break;
      case 'cable':
        setCable(value as string);
        break;
      case 'plannedDays':
        setPlannedDays(value as DayOfWeek[]);
        break;
    }
  };
  
  const handleDayToggle = (day: DayOfWeek) => {
    const updatedDays = plannedDays.includes(day)
      ? plannedDays.filter(d => d !== day)
      : [...plannedDays, day];
    
    setPlannedDays(updatedDays);
    onFieldsChange({ plannedDays: updatedDays });
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-sector">Setor</Label>
        <Select 
          value={sector} 
          onValueChange={(value) => updateFields('sector', value)}
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
          value={description}
          onChange={(e) => updateFields('description', e.target.value)}
          placeholder="Descrição da tarefa"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-discipline">Disciplina</Label>
          <Select 
            value={discipline} 
            onValueChange={(value) => updateFields('discipline', value)}
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
            value={team} 
            onValueChange={(value) => updateFields('team', value)}
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
            value={responsible} 
            onValueChange={(value) => updateFields('responsible', value)}
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
            value={executor} 
            onValueChange={(value) => updateFields('executor', value)}
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
          value={cable} 
          onValueChange={(value) => updateFields('cable', value)}
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
                checked={plannedDays.includes(day as DayOfWeek)}
                onCheckedChange={() => handleDayToggle(day as DayOfWeek)}
              />
              <Label htmlFor={`edit-day-${day}`} className="cursor-pointer">{name}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskFormFields;
