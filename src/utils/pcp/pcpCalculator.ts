
import { PCPBreakdown, Task } from "../../types";

export const calculatePCP = (tasks: Task[]): PCPBreakdown => {
  // Filter only tasks that have planned days
  const tasksWithPlannedDays = tasks.filter(task => task.plannedDays.length > 0);
  
  if (tasksWithPlannedDays.length === 0) {
    return {
      overall: { completedTasks: 0, totalTasks: 0, percentage: 0 },
      bySector: {},
      byResponsible: {}
    };
  }

  // Overall PCP - based on completionStatus
  const completedTasks = tasksWithPlannedDays.filter(task => task.completionStatus === "completed").length;
  const totalTasks = tasksWithPlannedDays.length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // By sector
  const sectors = Array.from(new Set(tasksWithPlannedDays.map(task => task.sector)));
  const bySector: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  sectors.forEach(sector => {
    const sectorTasks = tasksWithPlannedDays.filter(task => task.sector === sector);
    const sectorCompletedTasks = sectorTasks.filter(task => task.completionStatus === "completed").length;
    bySector[sector] = {
      completedTasks: sectorCompletedTasks,
      totalTasks: sectorTasks.length,
      percentage: (sectorCompletedTasks / sectorTasks.length) * 100
    };
  });

  // By responsible
  const responsibles = Array.from(new Set(tasksWithPlannedDays.map(task => task.responsible)));
  const byResponsible: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  responsibles.forEach(responsible => {
    const responsibleTasks = tasksWithPlannedDays.filter(task => task.responsible === responsible);
    const responsibleCompletedTasks = responsibleTasks.filter(task => task.completionStatus === "completed").length;
    byResponsible[responsible] = {
      completedTasks: responsibleCompletedTasks,
      totalTasks: responsibleTasks.length,
      percentage: (responsibleCompletedTasks / responsibleTasks.length) * 100
    };
  });

  return {
    overall: { completedTasks, totalTasks, percentage },
    bySector,
    byResponsible
  };
};

// Store historical PCP data by week start date
export const storeHistoricalPCPData = (
  historicalData: Map<string, number>, 
  weekStart: Date, 
  percentage: number
): Map<string, number> => {
  const weekKey = new Date(weekStart).toISOString().split('T')[0];
  historicalData.set(weekKey, percentage);
  return historicalData;
};
