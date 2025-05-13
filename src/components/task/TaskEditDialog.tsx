
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Task, DayOfWeek, TaskStatus } from "@/types";
import { useRegistry } from "@/context/RegistryContext";
import { dayNameMap } from "@/utils/pcp";
import { toast } from "@/components/ui/use-toast";

interface TaskEditDialogProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  task,
  isOpen,
  onOpenChange,
  onTaskUpdate
}) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();
  
  const [sector, setSector] = useState(task.sector);
  const [description, setDescription] = useState(task.description);
  const [discipline, setDiscipline] = useState(task.discipline);
  const [team, setTeam] = useState(task.team);
  const [responsible, setResponsible] = useState(task.responsible);
  const [executor, setExecutor] = useState(task.executor || "");
  const [cable, setCable] = useState(task.cable || "");
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>(task.plannedDays);
  
  const handleDayToggle = (day: DayOfWeek) => {
    setPlannedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  const handleSubmit = () => {
    // Create updated daily status based on planned days
    const updatedDailyStatus = task.dailyStatus.map(status => {
      const isNowPlanned = plannedDays.includes(status.day);
      const wasPlanned = task.plannedDays.includes(status.day);
      
      // Only change status if planning state changed and it's not already completed or not_done
      if (isNowPlanned !== wasPlanned && 
          status.status !== "completed" && 
          status.status !== "not_done") {
        return {
          ...status,
          status: isNowPlanned ? "planned" : "not_planned" as TaskStatus,
        };
      }
      return status;
    });
    
    const updatedTask = {
      ...task,
      sector,
      description,
      discipline,
      team,
      responsible,
      executor,
      cable,
      plannedDays,
      dailyStatus: updatedDailyStatus,
    };
    
    onTaskUpdate(updatedTask);
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso."
    });
    
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
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-sector">Setor</Label>
            <Select value={sector} onValueChange={setSector}>
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
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-discipline">Disciplina</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
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
              <Select value={team} onValueChange={setTeam}>
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
              <Select value={responsible} onValueChange={setResponsible}>
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
              <Select value={executor} onValueChange={setExecutor}>
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
            <Select value={cable} onValueChange={setCable}>
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
        
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;
