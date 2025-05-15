
import { useCallback } from "react";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { tarefasService } from "@/services/tarefaService";
import { formatDateToISO, convertTarefaToTask } from "@/utils/taskConversion";
import { DayOfWeek } from "@/types";

export const useTaskCreation = (
  session: any,
  tasks: Task[],
  weekStartDate: Date,
  updateTasksState: (updatedTasks: Task[]) => void
) => {
  const { toast } = useToast();

  const handleTaskCreate = useCallback(async (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Ensure we have a week start date
      if (!newTaskData.weekStartDate) {
        throw new Error("Data de início da semana (segunda-feira) é obrigatória");
      }
      
      // Initialize the new Tarefa object with required fields
      const novaTarefa: any = {
        obra_id: session.obraAtiva.id,
        setor: newTaskData.sector,
        item: newTaskData.item,
        descricao: newTaskData.description,
        disciplina: newTaskData.discipline,
        equipe: newTaskData.team,
        responsavel: newTaskData.responsible,
        executante: newTaskData.executor,
        cabo: newTaskData.cable,
        // Store the date in ISO format (YYYY-MM-DD)
        semana: formatDateToISO(newTaskData.weekStartDate),
        percentual_executado: 0,
        causa_nao_execucao: newTaskData.causeIfNotDone,
        seg: null,
        ter: null,
        qua: null,
        qui: null,
        sex: null,
        sab: null,
        dom: null
      };
      
      // Set day status based on plannedDays
      const dayMapping: Record<DayOfWeek, string> = {
        'mon': 'seg',
        'tue': 'ter',
        'wed': 'qua',
        'thu': 'qui',
        'fri': 'sex',
        'sat': 'sab',
        'sun': 'dom'
      };
      
      // Set planned days
      newTaskData.plannedDays.forEach(day => {
        const dbField = dayMapping[day];
        // Type assertion to handle dynamic field assignments
        novaTarefa[dbField] = 'Planejada';
      });
      
      console.log("Creating task with data:", novaTarefa);
      // Criar tarefa no Supabase
      const createdTarefa = await tarefasService.criarTarefa(novaTarefa);
      
      // Converter a tarefa para Task antes de adicionar à lista local
      const novaTask = convertTarefaToTask(createdTarefa);
      
      // Adicionar a nova tarefa à lista local
      const updatedTasks = [novaTask, ...tasks];
      updateTasksState(updatedTasks);
      
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso.",
      });
      
      return novaTask;
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [session.obraAtiva, tasks, toast, updateTasksState]);

  return {
    handleTaskCreate
  };
};
