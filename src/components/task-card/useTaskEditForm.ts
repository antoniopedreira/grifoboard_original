
import { useState } from "react";
import { Task, DayOfWeek } from "@/types";

export const useTaskEditForm = (task: Task) => {
  const [editFormData, setEditFormData] = useState<Omit<Task, "id" | "isFullyCompleted" | "dailyStatus">>(
    {
      sector: task.sector,
      item: task.item,
      description: task.description,
      discipline: task.discipline,
      team: task.team,
      responsible: task.responsible,
      executor: task.executor || "",
      cable: task.cable || "",
      plannedDays: task.plannedDays,
      causeIfNotDone: task.causeIfNotDone,
      weekStartDate: task.weekStartDate,
    }
  );

  const handleDayToggle = (day: DayOfWeek) => {
    setEditFormData(prev => {
      const updatedPlannedDays = prev.plannedDays.includes(day)
        ? prev.plannedDays.filter(d => d !== day)
        : [...prev.plannedDays, day];
      
      return {
        ...prev,
        plannedDays: updatedPlannedDays
      };
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeekDateChange = (date: Date) => {
    setEditFormData(prev => ({
      ...prev,
      weekStartDate: date
    }));
  };

  const isFormValid = () => {
    return (
      editFormData.sector?.trim() !== "" &&
      editFormData.description?.trim() !== "" &&
      editFormData.responsible?.trim() !== "" &&
      editFormData.plannedDays.length > 0 &&
      editFormData.weekStartDate !== undefined
    );
  };

  return {
    editFormData,
    handleDayToggle,
    handleEditFormChange,
    handleWeekDateChange,
    isFormValid
  };
};
