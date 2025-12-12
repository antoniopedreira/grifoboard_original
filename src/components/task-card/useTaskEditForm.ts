import { useState } from "react";
import { Task, DayOfWeek } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { tarefasService } from "@/services/tarefaService";

export const useTaskEditForm = (task: Task, onSaveSuccess?: (updatedTask: Task) => void) => {
  const { toast } = useToast();
  const [editFormData, setEditFormData] = useState<Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">>({
    sector: task.sector,
    item: task.item,
    description: task.description,
    discipline: task.discipline,
    team: task.team,
    responsible: task.responsible,
    executor: task.executor || "",
    plannedDays: task.plannedDays,
    causeIfNotDone: task.causeIfNotDone,
    weekStartDate: task.weekStartDate,
  });

  const handleDayToggle = (day: DayOfWeek) => {
    setEditFormData((prev) => {
      const updatedPlannedDays = prev.plannedDays.includes(day)
        ? prev.plannedDays.filter((d) => d !== day)
        : [...prev.plannedDays, day];

      return {
        ...prev,
        plannedDays: updatedPlannedDays,
      };
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWeekDateChange = (date: Date) => {
    setEditFormData((prev) => ({
      ...prev,
      weekStartDate: date,
    }));
  };

  const isFormValid = () => {
    return (
      (editFormData.sector?.trim() ?? "") !== "" &&
      (editFormData.description?.trim() ?? "") !== "" &&
      (editFormData.responsible?.trim() ?? "") !== "" &&
      editFormData.plannedDays.length > 0 &&
      editFormData.weekStartDate !== undefined
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e selecione pelo menos um dia.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTask: Task = {
        ...task,
        ...editFormData,
      };

      // CORREÇÃO AQUI: Passando ID e o Objeto separadamente
      await tarefasService.atualizarTarefa(updatedTask.id, updatedTask);

      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      if (onSaveSuccess) {
        onSaveSuccess(updatedTask);
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  return {
    editFormData,
    handleDayToggle,
    handleEditFormChange,
    handleWeekDateChange,
    isFormValid,
    handleSave,
  };
};
