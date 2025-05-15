
import { Task, DayOfWeek, TaskStatus } from "@/types";
import { Tarefa } from "@/types/supabase";

// Format ISO date to YYYY-MM-DD
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Function to convert Tarefa to Task
export const convertTarefaToTask = (tarefa: Tarefa): Task => {
  const task: Task = {
    id: tarefa.id,
    sector: tarefa.setor,
    item: tarefa.item,
    description: tarefa.descricao,
    discipline: tarefa.disciplina,
    team: tarefa.equipe,
    responsible: tarefa.responsavel,
    executor: tarefa.executante,
    cable: tarefa.cabo,
    // Convert daily status fields to plannedDays array
    plannedDays: [],
    dailyStatus: [], 
    isFullyCompleted: tarefa.percentual_executado === 1,
    causeIfNotDone: tarefa.causa_nao_execucao,
    // Convert string to Date
    weekStartDate: tarefa.semana ? new Date(tarefa.semana) : undefined
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

// Function to convert Task to Tarefa (partial for update)
export const convertTaskToTarefa = (task: Task): Partial<Tarefa> => {
  const tarefaToUpdate: Partial<Tarefa> = {
    setor: task.sector,
    item: task.item,
    descricao: task.description,
    disciplina: task.discipline,
    equipe: task.team,
    responsavel: task.responsible,
    executante: task.executor,
    cabo: task.cable,
    percentual_executado: task.isFullyCompleted ? 1 : 0,
    causa_nao_execucao: task.causeIfNotDone,
    // Convert Date to string format for database
    semana: task.weekStartDate ? formatDateToISO(task.weekStartDate) : undefined
  };

  // Update day status fields
  if (task.dailyStatus && task.dailyStatus.length > 0) {
    const daysMapping: Record<DayOfWeek, string> = {
      'mon': 'seg',
      'tue': 'ter',
      'wed': 'qua',
      'thu': 'qui',
      'fri': 'sex',
      'sat': 'sab',
      'sun': 'dom'
    };
    
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
  }

  return tarefaToUpdate;
};
