import { Obra, Tarefa } from "./supabase";

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type TaskStatus = 'planned' | 'completed' | 'not_done';

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
  responsible: string;
  team: string;  
  executor: string;
  cable: string;
  plannedDays: DayOfWeek[];
  dailyStatus: DailyStatus[];
  causeIfNotDone?: string;
  isFullyCompleted: boolean;
  weekStartDate?: Date;
}

export interface TasksList {
  tasks: Task[];
  weekStartDate: Date;
  onTaskAdded: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onTaskUpdated: (task: Task) => void;
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
  byDiscipline: Record<string, PCPData>;
  // New fields for dashboard
  byTeam?: Record<string, PCPData>;
  byExecutor?: Record<string, PCPData>;
  byCable?: Record<string, PCPData>;
}

export interface WeeklyPCPData {
  week: string; 
  percentage: number;
  date: Date;
  isCurrentWeek?: boolean;
}
