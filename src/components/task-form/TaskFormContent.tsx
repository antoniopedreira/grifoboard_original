
import { useState } from "react";
import { DayOfWeek } from "@/types";
import { useRegistry } from "@/context/RegistryContext";
import { useToast } from "@/hooks/use-toast";
import { getWeekStartDate } from "@/utils/pcp";
import { Button } from "@/components/ui/button";

import TaskDescriptionInput from "./TaskDescriptionInput";
import WeekDatePicker from "./WeekDatePicker";
import RegistrySelect from "./RegistrySelect";
import PlannedDaysSelector from "./PlannedDaysSelector";
import TaskFormFooter from "./TaskFormFooter";

interface TaskFormContentProps {
  onTaskCreate: (taskData: any) => void;
  onOpenChange: (open: boolean) => void;
  currentWeekStartDate?: Date;
}

const TaskFormContent: React.FC<TaskFormContentProps> = ({ 
  onTaskCreate, 
  onOpenChange, 
  currentWeekStartDate 
}) => {
  const { sectors, disciplines, teams, responsibles, executors } = useRegistry();
  const { toast } = useToast();
  
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [team, setTeam] = useState("");
  const [responsible, setResponsible] = useState("");
  const [executor, setExecutor] = useState("");
  
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>([]);
  
  // Default to current week's Monday if no date is provided
  const [weekStartDate, setWeekStartDate] = useState<Date | undefined>(
    currentWeekStartDate || getWeekStartDate(new Date())
  );
  
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
      cable: "",
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
    <>
      <div className="overflow-y-auto p-6 pt-4 max-h-[calc(90vh-140px)]">
        <div className="grid gap-5 py-2">
          {/* Description - first position */}
          <TaskDescriptionInput 
            description={description} 
            setDescription={setDescription} 
          />
          
          {/* Week start date picker */}
          <WeekDatePicker 
            weekStartDate={weekStartDate} 
            setWeekStartDate={setWeekStartDate} 
          />

          {/* Two columns layout for sector and discipline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RegistrySelect
              id="sector"
              label="Setor"
              value={sector}
              onValueChange={setSector}
              options={sectors}
              placeholder="Selecione o setor"
              onOpenRegistryDialog={handleOpenRegistryDialog}
            />
            
            <RegistrySelect
              id="discipline"
              label="Disciplina"
              value={discipline}
              onValueChange={setDiscipline}
              options={disciplines}
              placeholder="Selecione a disciplina"
            />
          </div>
          
          {/* Single column layout for executante */}
          <div className="grid grid-cols-1 gap-4">
            <RegistrySelect
              id="team"
              label="Executante"
              value={team}
              onValueChange={setTeam}
              options={teams}
              placeholder="Selecione o executante"
            />
          </div>
          
          {/* Two columns layout for responsible and executor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RegistrySelect
              id="responsible"
              label="Responsável"
              value={responsible}
              onValueChange={setResponsible}
              options={responsibles}
              placeholder="Selecione o responsável"
            />
            
            <RegistrySelect
              id="executor"
              label="Encarregado"
              value={executor}
              onValueChange={setExecutor}
              options={executors}
              placeholder="Selecione o encarregado"
            />
          </div>
          
          {/* Planned days - centered */}
          <PlannedDaysSelector 
            plannedDays={plannedDays} 
            setPlannedDays={setPlannedDays} 
          />
        </div>
      </div>
      
      {/* Form footer with submit button - Using TaskFormFooter component */}
      <TaskFormFooter 
        onSubmit={handleSubmit} 
        isFormValid={isFormValid()} 
      />
    </>
  );
};

export default TaskFormContent;
