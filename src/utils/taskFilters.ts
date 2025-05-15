
import { Task } from "@/types";

// Filter tasks based on week start date
export const filterTasksByWeek = (allTasks: Task[], startDate: Date): Task[] => {
  // Format the week start date for comparison (YYYY-MM-DD)
  const weekStartDateStr = formatDateToISO(startDate);
  
  return allTasks.filter(task => {
    // If task has no weekStartDate, skip it
    if (!task.weekStartDate) return false;
    
    // Format the task's week start date for comparison
    const taskWeekStartStr = formatDateToISO(task.weekStartDate);
    
    // Match tasks where the week start date is the same as the selected week
    return taskWeekStartStr === weekStartDateStr;
  });
};

// Format ISO date to YYYY-MM-DD - duplicated for module independence
const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
