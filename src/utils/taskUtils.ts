import { Task, DayOfWeek, TaskStatus } from "@/types";
import { Tarefa } from "@/types/supabase";

// Format date to local YYYY-MM-DD (avoiding timezone issues)
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função auxiliar para converter Tarefa para Task
export const convertTarefaToTask = (tarefa: Tarefa): Task => {
  const task: Task = {
    id: tarefa.id,
    sector: tarefa.setor,
    item: tarefa.item,
    description: tarefa.descricao,
    discipline: tarefa.disciplina,
    team: tarefa.executante,
    responsible: tarefa.responsavel,
    executor: tarefa.encarregado || tarefa.equipe,
    cable: tarefa.cabo,
    // Convert daily status fields to plannedDays array
    plannedDays: [],
    dailyStatus: [], 
    isFullyCompleted: tarefa.percentual_executado === 1,
    causeIfNotDone: tarefa.causa_nao_execucao,
    // Convert string to Date (local date to avoid timezone issues)
    weekStartDate: tarefa.semana ? new Date(tarefa.semana + 'T00:00:00') : undefined
  };
  
  // Process daily status from individual day fields
  const daysMapping: Record<string, DayOfWeek> = {
    'seg': 'mon',
    'ter': 'tue',
    'qua': 'wed',
    'qui': 'thu',
    'sex': 'fri',
    'sab': 'sat',
    'dom': 'sun'
  };
  
  // Add days to plannedDays if they exist in the tarefa
  Object.entries(daysMapping).forEach(([dbField, dayOfWeek]) => {
    const dayStatus = tarefa[dbField as keyof Tarefa];
    if (dayStatus === 'Planejada' || dayStatus === 'Executada' || dayStatus === 'Não Feita') {
      task.plannedDays.push(dayOfWeek);
      
      // Add day status to dailyStatus array
      let status: TaskStatus;
      if (dayStatus === 'Executada') {
        status = 'completed';
      } else if (dayStatus === 'Não Feita') {
        status = 'not_done';
      } else {
        status = 'planned';
      }
      
      task.dailyStatus.push({
        day: dayOfWeek,
        status
      });
    }
  });
  
  return task;
};

// Helper to convert Task status to Tarefa format
export const convertTaskStatusToTarefa = (task: Task): Partial<Tarefa> => {
  const tarefaToUpdate: Partial<Tarefa> = {
    setor: task.sector,
    item: task.item,
    descricao: task.description,
    disciplina: task.discipline,
    equipe: task.team,
    executante: task.team,
    responsavel: task.responsible,
    encarregado: task.executor,
    cabo: task.cable,
    percentual_executado: task.isFullyCompleted ? 1 : 0,
    causa_nao_execucao: task.causeIfNotDone,
    // Convert Date to string format for database
    semana: task.weekStartDate ? formatDateToISO(task.weekStartDate) : undefined
  };
  
  // Clear all day fields first
  const daysMapping: Record<DayOfWeek, string> = {
    'mon': 'seg',
    'tue': 'ter',
    'wed': 'qua',
    'thu': 'qui',
    'fri': 'sex',
    'sat': 'sab',
    'sun': 'dom'
  };
  
  // Reset all day fields to null initially
  Object.values(daysMapping).forEach(dbField => {
    (tarefaToUpdate as any)[dbField] = null;
  });
  
  // Update day status fields based on dailyStatus
  if (task.dailyStatus && task.dailyStatus.length > 0) {
    task.dailyStatus.forEach(dailyStatus => {
      const dbField = daysMapping[dailyStatus.day];
      if (dbField) {
        let status = '';
        
        if (dailyStatus.status === 'completed') {
          status = 'Executada';
        } else if (dailyStatus.status === 'not_done') {
          status = 'Não Feita';
        } else if (dailyStatus.status === 'planned') {
          status = 'Planejada';
        }
        
        // Type assertion to handle dynamic field assignments
        (tarefaToUpdate as any)[dbField] = status;
      }
    });
  } else if (task.plannedDays && task.plannedDays.length > 0) {
    // Fallback: if no dailyStatus but plannedDays exist, set them as "Planejada"
    task.plannedDays.forEach(plannedDay => {
      const dbField = daysMapping[plannedDay];
      if (dbField) {
        (tarefaToUpdate as any)[dbField] = 'Planejada';
      }
    });
  }
  
  return tarefaToUpdate;
};