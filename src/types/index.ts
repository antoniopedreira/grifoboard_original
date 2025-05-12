
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type TaskStatus = "planned" | "completed" | "not_done" | "not_planned";

export type TaskCompletionStatus = "completed" | "not_completed";

export interface DailyStatus {
  day: DayOfWeek;
  status: TaskStatus;
}

export interface Task {
  id: string;
  sector: string;
  item: string;
  description: string;
  discipline: string;
  team: string;
  responsible: string;
  plannedDays: DayOfWeek[];
  dailyStatus: DailyStatus[];
  isFullyCompleted: boolean;
  completionStatus: TaskCompletionStatus;
  causeIfNotDone?: string;
  weekStartDate?: Date; // The start of the week this task belongs to
}

export interface PCPData {
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}

export interface PCPBreakdown {
  overall: PCPData;
  bySector: Record<string, PCPData>;
  byResponsible: Record<string, PCPData>;
}

export interface WeeklyPCPData {
  week: string;
  percentage: number;
  date: Date; // For sorting purposes
}
