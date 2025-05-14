
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOfWeek, Task } from "@/types";
import { dayNameMap } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";

interface TaskFormProps {
  onTaskCreate: (task: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreate, isOpen, onOpenChange }) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();
  
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [team, setTeam] = useState("");
  const [responsible, setResponsible] = useState("");
  const [executor, setExecutor] = useState("");
  const [cable, setCable] = useState("");
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>([]);
  
  const handleDayToggle = (day: DayOfWeek) => {
    setPlannedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  const handleSubmit = () => {
    onTaskCreate({
      sector,
      item: "", // Mantemos o campo no objeto, mas não o exibimos mais na interface
      description,
      discipline,
      team,
      responsible,
      executor,
      cable,
      plannedDays,
    });
    
    // Reset form fields
    setSector("");
    setDescription("");
    setDiscipline("");
    setTeam("");
    setResponsible("");
    setExecutor("");
    setCable("");
    setPlannedDays([]);
    
    // Close the dialog
    onOpenChange(false);
  };
  
  const isFormValid = () => {
    return (
      sector.trim() !== "" &&
      description.trim() !== "" &&
      responsible.trim() !== "" &&
      plannedDays.length > 0
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sector">Setor</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger id="sector">
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
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discipline">Disciplina</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline">
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
              <Label htmlFor="team">Equipe</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="team">
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
              <Label htmlFor="responsible">Responsável</Label>
              <Select value={responsible} onValueChange={setResponsible}>
                <SelectTrigger id="responsible">
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
              <Label htmlFor="executor">Executante</Label>
              <Select value={executor} onValueChange={setExecutor}>
                <SelectTrigger id="executor">
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
            <Label htmlFor="cable">Cabo</Label>
            <Select value={cable} onValueChange={setCable}>
              <SelectTrigger id="cable">
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
                    id={`day-${day}`}
                    checked={plannedDays.includes(day as DayOfWeek)}
                    onCheckedChange={() => handleDayToggle(day as DayOfWeek)}
                  />
                  <Label htmlFor={`day-${day}`} className="cursor-pointer">{name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Adicionar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
