
import { useState } from "react";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface UseTaskEditResult {
  formData: {
    sector: string;
    description: string;
    discipline: string;
    team: string;
    responsible: string;
    executor: string;
    cable: string;
    plannedDays: DayOfWeek[];
  };
  updateField: (field: string, value: any) => void;
  handleSubmit: () => void;
  isFormValid: () => boolean;
}

export const useTaskEdit = (
  task: Task,
  onTaskUpdate: (updatedTask: Task) => void,
  onClose: () => void
): UseTaskEditResult => {
  // Form state
  const [sector, setSector] = useState(task.sector);
  const [description, setDescription] = useState(task.description);
  const [discipline, setDiscipline] = useState(task.discipline);
  const [team, setTeam] = useState(task.team);
  const [responsible, setResponsible] = useState(task.responsible);
  const [executor, setExecutor] = useState(task.executor || "");
  const [cable, setCable] = useState(task.cable || "");
  const [plannedDays, setPlannedDays] = useState<DayOfWeek[]>(task.plannedDays);

  const updateField = (field: string, value: any) => {
    switch (field) {
      case 'sector':
        setSector(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'discipline':
        setDiscipline(value);
        break;
      case 'team':
        setTeam(value);
        break;
      case 'responsible':
        setResponsible(value);
        break;
      case 'executor':
        setExecutor(value);
        break;
      case 'cable':
        setCable(value);
        break;
      case 'plannedDays':
        setPlannedDays(value);
        break;
    }
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
    
    onClose();
  };

  const isFormValid = () => {
    return (
      sector.trim() !== "" &&
      description.trim() !== "" &&
      responsible.trim() !== "" &&
      plannedDays.length > 0
    );
  };

  return {
    formData: {
      sector,
      description,
      discipline,
      team,
      responsible,
      executor,
      cable,
      plannedDays
    },
    updateField,
    handleSubmit,
    isFormValid
  };
};
