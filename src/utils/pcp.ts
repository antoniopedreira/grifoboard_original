
import { DayOfWeek, PCPBreakdown, Task, TaskStatus } from "../types";

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

export const getCurrentWeekDates = (): { start: Date, end: Date } => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Calculate days to subtract to get to Monday (first day of week)
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
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

  // Overall PCP - now based on completionStatus
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

export const generateMockTasks = (): Task[] => {
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
      isFullyCompleted: false,  // This is now ignored for PCP calculation
      completionStatus,
      causeIfNotDone: completionStatus === "completed" ? undefined : "Falta de material"
    });
  }
  
  return mockTasks;
};
