
import { PCPBreakdown, Task, WeeklyPCPData } from "../../types";

export const calculatePCP = (tasks: Task[]): PCPBreakdown => {
  // Filter only tasks that have planned days
  const tasksWithPlannedDays = tasks.filter(task => task.plannedDays.length > 0);
  
  if (tasksWithPlannedDays.length === 0) {
    return {
      overall: { completedTasks: 0, totalTasks: 0, percentage: 0 },
      bySector: {},
      byResponsible: {},
      byDiscipline: {},
      byTeam: {},
      byExecutor: {},
      byCable: {}
    };
  }

  // Overall PCP - based on isFullyCompleted flag
  const completedTasks = tasksWithPlannedDays.filter(task => task.isFullyCompleted).length;
  const totalTasks = tasksWithPlannedDays.length;
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // By sector
  const sectors = Array.from(new Set(tasksWithPlannedDays.map(task => task.sector)));
  const bySector: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  sectors.forEach(sector => {
    const sectorTasks = tasksWithPlannedDays.filter(task => task.sector === sector);
    const sectorCompletedTasks = sectorTasks.filter(task => task.isFullyCompleted).length;
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
    const responsibleCompletedTasks = responsibleTasks.filter(task => task.isFullyCompleted).length;
    byResponsible[responsible] = {
      completedTasks: responsibleCompletedTasks,
      totalTasks: responsibleTasks.length,
      percentage: (responsibleCompletedTasks / responsibleTasks.length) * 100
    };
  });
  
  // By discipline
  const disciplines = Array.from(new Set(tasksWithPlannedDays.map(task => task.discipline)));
  const byDiscipline: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  disciplines.forEach(discipline => {
    const disciplineTasks = tasksWithPlannedDays.filter(task => task.discipline === discipline);
    const disciplineCompletedTasks = disciplineTasks.filter(task => task.isFullyCompleted).length;
    byDiscipline[discipline] = {
      completedTasks: disciplineCompletedTasks,
      totalTasks: disciplineTasks.length,
      percentage: (disciplineCompletedTasks / disciplineTasks.length) * 100
    };
  });
  
  // New calculations for the dashboard
  
  // By team
  const teams = Array.from(new Set(tasksWithPlannedDays.map(task => task.team)));
  const byTeam: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  teams.forEach(team => {
    const teamTasks = tasksWithPlannedDays.filter(task => task.team === team);
    const teamCompletedTasks = teamTasks.filter(task => task.isFullyCompleted).length;
    byTeam[team] = {
      completedTasks: teamCompletedTasks,
      totalTasks: teamTasks.length,
      percentage: (teamCompletedTasks / teamTasks.length) * 100
    };
  });
  
  // By executor
  const executors = Array.from(new Set(tasksWithPlannedDays.map(task => task.executor)));
  const byExecutor: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  executors.forEach(executor => {
    const executorTasks = tasksWithPlannedDays.filter(task => task.executor === executor);
    const executorCompletedTasks = executorTasks.filter(task => task.isFullyCompleted).length;
    byExecutor[executor] = {
      completedTasks: executorCompletedTasks,
      totalTasks: executorTasks.length,
      percentage: (executorCompletedTasks / executorTasks.length) * 100
    };
  });
  
  // By cable
  const cables = Array.from(new Set(tasksWithPlannedDays.map(task => task.cable)));
  const byCable: Record<string, { completedTasks: number; totalTasks: number; percentage: number }> = {};
  
  cables.forEach(cable => {
    const cableTasks = tasksWithPlannedDays.filter(task => task.cable === cable);
    const cableCompletedTasks = cableTasks.filter(task => task.isFullyCompleted).length;
    byCable[cable] = {
      completedTasks: cableCompletedTasks,
      totalTasks: cableTasks.length,
      percentage: (cableCompletedTasks / cableTasks.length) * 100
    };
  });

  return {
    overall: { completedTasks, totalTasks, percentage },
    bySector,
    byResponsible,
    byDiscipline,
    byTeam,
    byExecutor,
    byCable
  };
};

// Store historical PCP data by week start date
export const storeHistoricalPCPData = (
  historicalData: Map<string, number>, 
  weekStart: Date, 
  percentage: number
): Map<string, number> => {
  const weekKey = new Date(weekStart).toISOString().split('T')[0];
  const newHistoricalData = new Map(historicalData);
  newHistoricalData.set(weekKey, percentage);
  return newHistoricalData;
};

// Generate weekly PCP data including the previous weeks
export const generateWeeklyPCPData = (
  currentWeekStart: Date,
  currentWeekPCP: number,
  historicalData: Map<string, number>
): WeeklyPCPData[] => {
  const result: WeeklyPCPData[] = [];
  
  // Add data for previous 3 weeks and current week
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - (7 * i));
    
    const weekKey = weekStart.toISOString().split('T')[0];
    
    // Get stored PCP value or generate a random one (for demo/testing purposes)
    const pcpValue = i === 0 ? currentWeekPCP : 
                   historicalData.has(weekKey) ? 
                   historicalData.get(weekKey)! : 
                   Math.round(Math.random() * 70) + 10; // Random between 10-80%
    
    // Add to results
    result.push({
      week: `Week ${i+1}`,
      percentage: pcpValue,
      date: weekStart,
      isCurrentWeek: i === 0  // Current week is at i=0
    });
  }
  
  return result;
};
