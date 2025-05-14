export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TaskStatus = "planned" | "completed" | "not_done";

export interface DayStatus {
  day: DayOfWeek;
  status: TaskStatus;
}

export interface PCPData {
  planned: number;
  completed: number;
  not_done: number;
  overall: {
    percentage: number;
    status: TaskStatus;
  };
}

export interface WeeklyPCPData {
  week: string;
  percentage: number;
  date: Date;
  isCurrentWeek: boolean;
}

// Adicionar a propriedade weekStartDate à interface Task
export interface Task {
  id: string;
  sector: string;
  item: string;
  description: string;
  discipline: string;
  team: string;
  responsible: string;
  executor?: string;
  cable?: string;
  plannedDays: DayOfWeek[];
  dailyStatus: DayStatus[];
  isFullyCompleted: boolean;
  causeIfNotDone?: string;
  weekStartDate?: Date;
}
