
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { Tarefa } from "@/types/supabase";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import TaskForm from "@/components/TaskForm";
import WeekNavigation from "@/components/WeekNavigation";
import { Button } from "@/components/ui/button";
import { calculatePCP, getPreviousWeekDates, getNextWeekDates } from "@/utils/pcp";
import { useToast } from "@/hooks/use-toast";
import RegistryDialog from "@/components/RegistryDialog";
import { useAuth } from "@/context/AuthContext";
import { tarefasService } from "@/services/tarefaService";

// Função auxiliar para converter Tarefa para Task
const convertTarefaToTask = (tarefa: Tarefa): Task => {
  const task: Task = {
    id: tarefa.id,
    sector: tarefa.sector,
    item: tarefa.item,
    description: tarefa.description,
    discipline: tarefa.discipline,
    team: tarefa.team,
    responsible: tarefa.responsible,
    executor: tarefa.executor,
    cable: tarefa.cable,
    plannedDays: tarefa.plannedDays,
    dailyStatus: tarefa.dailyStatus,
    isFullyCompleted: tarefa.isFullyCompleted,
    completionStatus: tarefa.completionStatus,
    causeIfNotDone: tarefa.causeIfNotDone,
    weekStartDate: tarefa.weekStartDate
  };
  return task;
};

const MainPageContent = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  
  const [weekStartDate, setWeekStartDate] = useState(new Date());
  const [weekEndDate, setWeekEndDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tarefas quando a obra ativa mudar ou a data da semana mudar
  useEffect(() => {
    if (session.obraAtiva) {
      loadTasks();
    }
  }, [session.obraAtiva, weekStartDate]);

  // Calcular data de fim da semana quando a data de início mudar
  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  const loadTasks = async () => {
    if (!session.obraAtiva) return;
    
    setIsLoading(true);
    try {
      const tarefas = await tarefasService.listarTarefas(session.obraAtiva.id);
      // Converter Tarefas para Tasks antes de atualizar o estado
      const convertedTasks = tarefas.map(convertTarefaToTask);
      setTasks(convertedTasks);
      
      // Calcular dados do PCP para o gráfico semanal
      const pcpData = calculatePCP(convertedTasks);
      setWeeklyPCPData([pcpData]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      // Extrair apenas os campos necessários para atualizar no Supabase
      const { id, ...taskUpdate } = updatedTask;
      await tarefasService.atualizarTarefa(id, taskUpdate);
      
      // Atualizar a tarefa localmente
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await tarefasService.excluirTarefa(taskId);
      
      // Remover a tarefa localmente
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleCauseSelect = (cause: string) => {
    // Se user clicks the same cause, clear the filter
    if (selectedCause === cause) {
      setSelectedCause(null);
      toast({
        title: "Filtro removido",
        description: "Mostrando todas as tarefas.",
      });
    } else {
      setSelectedCause(cause);
      toast({
        title: "Tarefas filtradas",
        description: `Mostrando tarefas com causa: ${cause}`,
      });
    }
  };
  
  const handleTaskCreate = async (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    try {
      if (!session.obraAtiva) {
        throw new Error("Nenhuma obra ativa selecionada");
      }
      
      // Criar tarefa no Supabase
      const novaTarefa = await tarefasService.criarTarefa(newTaskData, session.obraAtiva.id);
      
      // Converter a tarefa para Task antes de adicionar à lista local
      const novaTask = convertTarefaToTask(novaTarefa);
      
      // Adicionar a nova tarefa à lista local
      const updatedTasks = [novaTask, ...tasks];
      setTasks(updatedTasks);
      
      // Atualizar dados do PCP
      const pcpData = calculatePCP(updatedTasks);
      setWeeklyPCPData([pcpData]);
      
      toast({
        title: "Tarefa criada",
        description: "Nova tarefa adicionada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const navigateToPreviousWeek = () => {
    const { start } = getPreviousWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null); // Clear filter when changing week
  };
  
  const navigateToNextWeek = () => {
    const { start } = getNextWeekDates(weekStartDate);
    setWeekStartDate(start);
    setSelectedCause(null); // Clear filter when changing week
  };
  
  const pcpData = calculatePCP(tasks);
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {session.obraAtiva ? `Tarefas - ${session.obraAtiva.nome_obra}` : 'Planejamento Semanal'}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => setIsRegistryOpen(true)}
          >
            Cadastros
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>Nova Tarefa</Button>
        </div>
      </div>
      
      {/* Week Navigation */}
      <WeekNavigation
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        onPreviousWeek={navigateToPreviousWeek}
        onNextWeek={navigateToNextWeek}
      />
      
      {/* PCP Charts */}
      <PCPChart 
        pcpData={pcpData} 
        weeklyData={weeklyPCPData}
        tasks={tasks}
        onCauseSelect={handleCauseSelect}
      />
      
      {selectedCause && (
        <div className="mb-4 px-4 py-2 bg-muted rounded-lg flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Filtro ativo: </span>
            <span className="text-primary">{selectedCause}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedCause(null)}
          >
            Limpar
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Carregando tarefas...</p>
        </div>
      ) : (
        <TaskList 
          tasks={tasks} 
          onTaskUpdate={handleTaskUpdate} 
          onTaskDelete={handleTaskDelete}
          selectedCause={selectedCause}
        />
      )}
      
      <TaskForm 
        onTaskCreate={handleTaskCreate} 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <RegistryDialog 
        isOpen={isRegistryOpen} 
        onOpenChange={setIsRegistryOpen} 
      />
    </>
  );
};

export default MainPageContent;
