import { DayOfWeek, PCPBreakdown, Task, TaskStatus, WeeklyPCPData } from "../types";

export const dayNameMap: Record<DayOfWeek, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
  sat: "Sáb",
  sun: "Dom"
};

export const getFullDayName = (day: DayOfWeek): string => {
  const map: Record<DayOfWeek, string> = {
    mon: "Segunda",
    tue: "Terça",
    wed: "Quarta",
    thu: "Quinta",
    fri: "Sexta",
    sat: "Sábado",
    sun: "Domingo"
  };
  return map[day];
};

// Get the start date (Monday) from a given date
export const getWeekStartDate = (date: Date): Date => {
  const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back to Monday
  
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysToSubtract);
  monday.setHours(0, 0, 0, 0);
  
  return monday;
};

// Get the end date (Sunday) from a given date's week
export const getWeekEndDate = (date: Date): Date => {
  const startDate = getWeekStartDate(date);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return endDate;
};

// Format date as a string for display
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const startDay = startDate.getDate().toString().padStart(2, '0');
  const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
  
  const endDay = endDate.getDate().toString().padStart(2, '0');
  const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
  
  return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
};

export const getCurrentWeekDates = (): { start: Date, end: Date } => {
  const today = new Date();
  const startDate = getWeekStartDate(today);
  const endDate = getWeekEndDate(today);
  
  return { start: startDate, end: endDate };
};

// Navigate to previous week
export const getPreviousWeekDates = (currentStart: Date): { start: Date, end: Date } => {
  const newStart = new Date(currentStart);
  newStart.setDate(currentStart.getDate() - 7);
  
  const newEnd = new Date(newStart);
  newEnd.setDate(newStart.getDate() + 6);
  newEnd.setHours(23, 59, 59, 999);
  
  return { start: newStart, end: newEnd };
};

// Navigate to next week
export const getNextWeekDates = (currentStart: Date): { start: Date, end: Date } => {
  const newStart = new Date(currentStart);
  newStart.setDate(currentStart.getDate() + 7);
  
  const newEnd = new Date(newStart);
  newEnd.setDate(newStart.getDate() + 6);
  newEnd.setHours(23, 59, 59, 999);
  
  return { start: newStart, end: newEnd };
};

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

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-500 border-green-600";
    case "planned":
      return "bg-blue-500 border-blue-600";
    case "not_done":
      return "bg-red-500 border-red-600";
    case "not_planned":
    default:
      return "bg-gray-200 border-gray-300";
  }
};

export const generateMockTasks = (weekStart?: Date): Task[] => {
  const sectors = ["Fundação", "Alvenaria", "Estrutura", "Acabamento", "Instalações"];
  const disciplines = ["Civil", "Elétrica", "Hidráulica", "Arquitetura"];
  const teams = ["Equipe A", "Equipe B", "Equipe C"];
  const responsibles = ["João Silva", "Maria Oliveira", "Carlos Santos"];
  
  const mockTasks: Task[] = [];
  
  for (let i = 1; i <= 15; i++) {
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const discipline = disciplines[Math.floor(Math.random() * disciplines.length)];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const responsible = responsibles[Math.floor(Math.random() * responsibles.length)];
    
    // Randomly select which days are planned
    const allDays: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const plannedDays: DayOfWeek[] = [];
    
    allDays.forEach(day => {
      if (Math.random() > 0.5) {
        plannedDays.push(day);
      }
    });
    
    // Create daily status for each day
    const dailyStatus: { day: DayOfWeek; status: TaskStatus }[] = allDays.map(day => {
      if (plannedDays.includes(day)) {
        // If day is planned, randomly assign status
        const rand = Math.random();
        let status: TaskStatus = "planned";
        if (rand < 0.6) {
          status = "completed";
        } else if (rand < 0.9) {
          status = "not_done";
        }
        return { day, status };
      } else {
        return { day, status: "not_planned" };
      }
    });
    
    // Randomly assign completionStatus
    const completionStatus = Math.random() > 0.5 ? "completed" : "not_completed";
    
    mockTasks.push({
      id: `task-${i}`,
      sector,
      item: `Item ${i}`,
      description: `Tarefa ${i} de ${sector}`,
      discipline,
      team,
      responsible,
      plannedDays,
      dailyStatus,
      isFullyCompleted: false,
      completionStatus,
      causeIfNotDone: completionStatus === "completed" ? undefined : "Falta de material",
      weekStartDate: weekStart ? new Date(weekStart) : undefined
    });
  }
  
  return mockTasks;
};

// Generate mock weekly PCP data for the chart
export const generateMockWeeklyData = (currentWeekStart: Date, weeksToGenerate: number = 4): WeeklyPCPData[] => {
  const weeklyData: WeeklyPCPData[] = [];
  
  // Generate previous weeks data
  for (let i = weeksToGenerate - 1; i >= 0; i--) {
    const weekDate = new Date(currentWeekStart);
    weekDate.setDate(currentWeekStart.getDate() - (7 * i));
    
    const startDate = getWeekStartDate(weekDate);
    const endDate = getWeekEndDate(startDate);
    const dateStr = formatDateRange(startDate, endDate);
    
    // Generate a random percentage between 30 and 95
    const percentage = Math.floor(Math.random() * (95 - 30 + 1)) + 30;
    
    weeklyData.push({
      week: dateStr,
      percentage,
      date: new Date(startDate)
    });
  }
  
  return weeklyData;
};

// Generate weekly PCP data for the current week and previous weeks
export const generateWeeklyPCPData = (currentWeekStart: Date, currentWeekPCP: number, historicalData: Map<string, number> = new Map()): WeeklyPCPData[] => {
  const weeklyData: WeeklyPCPData[] = [];
  
  // Track weeks we've already added to avoid duplicates
  const addedWeekKeys = new Set<string>();
  
  // Generate data for previous three weeks
  for (let i = 3; i >= 0; i--) {
    // Calculate the week start date
    const weekDate = new Date(currentWeekStart);
    if (i > 0) {
      weekDate.setDate(currentWeekStart.getDate() - (7 * i));
    }
    
    const startDate = getWeekStartDate(weekDate);
    const endDate = getWeekEndDate(startDate);
    const dateStr = formatDateRange(startDate, endDate);
    
    // Check if this week is already added
    const weekKey = startDate.toISOString().split('T')[0];
    if (addedWeekKeys.has(weekKey)) {
      continue;
    }
    addedWeekKeys.add(weekKey);
    
    // Calculate percentage
    let percentage;
    if (i === 0) {
      // Current week
      percentage = currentWeekPCP;
    } else {
      // Check if we have historical data for this week
      percentage = historicalData.get(weekKey);
      if (percentage === undefined) {
        // Generate a random percentage between 30 and 95 for previous weeks if no historical data
        percentage = Math.floor(Math.random() * (95 - 30 + 1)) + 30;
      }
    }
    
    weeklyData.push({
      week: dateStr,
      percentage,
      date: new Date(startDate),
      isCurrentWeek: i === 0
    });
  }
  
  return weeklyData;
};

// Store historical PCP data by week start date
export const storeHistoricalPCPData = (
  historicalData: Map<string, number>, 
  weekStart: Date, 
  percentage: number
): Map<string, number> => {
  const weekKey = getWeekStartDate(weekStart).toISOString().split('T')[0];
  historicalData.set(weekKey, percentage);
  return historicalData;
};
