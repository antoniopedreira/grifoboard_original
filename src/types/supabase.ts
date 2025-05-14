
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
  setor: string;
  item: string;
  descricao: string;
  disciplina: string;
  equipe: string;
  responsavel: string;
  executante: string;
  cabo: string;
  semana: string;
  seg: string;
  ter: string;
  qua: string;
  qui: string;
  sex: string;
  sab: string;
  dom: string;
  percentual_executado: number;
  causa_nao_execucao?: string;
  created_at: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  obraAtiva: Obra | null;
}
