
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

export interface Tarefa extends Omit<Task, 'id'> {
  id: string;
  obra_id: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  obraAtiva: Obra | null;
}
