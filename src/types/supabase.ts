
import { Task } from "@/types";

export interface Obra {
  id: string;
  nome_obra: string;
  localizacao: string;
  data_inicio: string;
  status: string;
  usuario_id: string;
  created_at: string;
}

export interface Tarefa {
  id: string;
  obra_id: string;
  sector: string;
  item: string;
  description: string;
  discipline: string;
  team: string;
  responsible: string;
  executor?: string;
  cable?: string;
  planneddays: string[]; // lowercase to match database column name
  dailystatus: any[]; // lowercase to match database column name
  isfullycompleted: boolean; // lowercase to match database column name
  completionstatus: string; // lowercase to match database column name
  causeifnotdone?: string; // lowercase to match database column name
  weekstartdate?: string; // lowercase to match database column name
  created_at: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  obraAtiva: Obra | null;
}
