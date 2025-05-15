
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
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOfWeek, Task } from "@/types";
import { dayNameMap, getWeekStartDate } from "@/utils/pcp";
import { useRegistry } from "@/context/RegistryContext";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onTaskCreate: (task: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeekStartDate?: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreate, isOpen, onOpenChange, currentWeekStartDate }) => {
  const { sectors, disciplines, teams, responsibles, executors, cables } = useRegistry();
  
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [team, setTeam] = useState("");
  const [responsible, setResponsible] = useState("");
  const [executor, setExecutor] = useState("");
  const [cable, setCable] = useState("");
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>([]);
  
  // Default to current week's Monday if no date is provided
  const [weekStartDate, setWeekStartDate] = useState<Date | undefined>(
    currentWeekStartDate || getWeekStartDate(new Date())
  );
  
  const handleDayToggle = (day: DayOfWeek) => {
    setPlannedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  const handleSubmit = () => {
    // Ensure we have a valid week start date
    if (!weekStartDate) {
      toast({
        title: "Data da semana requerida",
        description: "Por favor, selecione a data de início da semana (segunda-feira).",
        variant: "destructive",
      });
      return;
    }
    
    onTaskCreate({
      sector,
      item: "",
      description,
      discipline,
      team,
      responsible,
      executor,
      cable,
      plannedDays,
      weekStartDate,
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
    setWeekStartDate(currentWeekStartDate || getWeekStartDate(new Date()));
    
    // Close the dialog
    onOpenChange(false);
  };
  
  const isFormValid = () => {
    return (
      sector.trim() !== "" &&
      description.trim() !== "" &&
      responsible.trim() !== "" &&
      plannedDays.length > 0 &&
      weekStartDate !== undefined
    );
  };
  
  const handleOpenRegistryDialog = () => {
    toast({
      title: "Cadastros vazios",
      description: "Adicione itens aos cadastros através do botão 'Cadastro' na página principal.",
      variant: "destructive",
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Nova Tarefa</DialogTitle>
            <DialogClose className="rounded-full hover:bg-muted w-7 h-7 flex items-center justify-center focus:outline-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          {/* Description - first position */}
          <div className="space-y-2 w-full">
            <Label htmlFor="description" className="font-medium">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
            />
          </div>
          
          {/* Week start date picker */}
          <div className="space-y-2 w-full">
            <Label htmlFor="weekStartDate" className="font-medium">Semana (Segunda-feira)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="weekStartDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !weekStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weekStartDate ? format(weekStartDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={weekStartDate}
                  onSelect={(date) => {
                    // Force selection to be Monday by finding the Monday of the selected date's week
                    if (date) {
                      setWeekStartDate(getWeekStartDate(date));
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

          {/* Two columns layout for sector and discipline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Setor */}
            <div className="space-y-2">
              <Label htmlFor="sector" className="font-medium">Setor</Label>
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger id="sector">
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
                      <Button 
                        variant="link" 
                        className="mt-2 p-0 h-auto text-primary"
                        onClick={handleOpenRegistryDialog}
                      >
                        Adicione através do botão "Cadastro"
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="discipline" className="font-medium">Disciplina</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger id="discipline">
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
          </div>
          
          {/* Two columns layout for cable and team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cabo */}
            <div className="space-y-2">
              <Label htmlFor="cable" className="font-medium">Cabo</Label>
              <Select value={cable} onValueChange={setCable}>
                <SelectTrigger id="cable">
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
            
            {/* Equipe */}
            <div className="space-y-2">
              <Label htmlFor="team" className="font-medium">Equipe</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger id="team">
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
              <Label htmlFor="responsible" className="font-medium">Responsável</Label>
              <Select value={responsible} onValueChange={setResponsible}>
                <SelectTrigger id="responsible">
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
              <Label htmlFor="executor" className="font-medium">Executante</Label>
              <Select value={executor} onValueChange={setExecutor}>
                <SelectTrigger id="executor">
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
        
        <div className="flex justify-end mt-6 sticky bottom-0 pt-4 bg-background">
          <Button onClick={handleSubmit} disabled={!isFormValid()}>
            Adicionar Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
