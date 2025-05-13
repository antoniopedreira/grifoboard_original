import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import TaskForm from "@/components/TaskForm";
import WeekNavigation from "@/components/WeekNavigation";
import { Button } from "@/components/ui/button";
import { calculatePCP, getPreviousWeekDates, getNextWeekDates } from "@/utils/pcp";
import { useToast } from "@/hooks/use-toast";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import RegistryDialog from "@/components/RegistryDialog";

const MainPageContent = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  
  const {
    weekStartDate,
    setWeekStartDate,
    weekEndDate,
    tasks,
    setTasks,
    weeklyPCPData,
    updateHistoricalDataAndCharts
  } = useWeeklyData();
  
  const pcpData = calculatePCP(tasks);
  
  const handleTaskUpdate = (updatedTask: Task) => {
    // Update the task
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    
    // Update charts with consistent historical data
    updateHistoricalDataAndCharts(updatedTasks);
    
    toast({
      title: "Tarefa atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleTaskDelete = (taskId: string) => {
    // Remove the task
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    // Update charts with consistent historical data
    updateHistoricalDataAndCharts(updatedTasks);
    
    toast({
      title: "Tarefa excluída",
      description: "A tarefa foi removida com sucesso.",
    });
  };
  
  const handleCauseSelect = (cause: string) => {
    // If user clicks the same cause, clear the filter
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
  
  const handleTaskCreate = (newTaskData: Omit<Task, "id" | "dailyStatus" | "isFullyCompleted">) => {
    const allDays: Task["dailyStatus"] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map(day => ({
      day: day as any,
      status: newTaskData.plannedDays.includes(day as any) ? "planned" : "not_planned"
    }));
    
    const newTask: Task = {
      id: uuidv4(),
      ...newTaskData,
      dailyStatus: allDays,
      isFullyCompleted: false,
      completionStatus: newTaskData.completionStatus || "not_completed",
      weekStartDate: new Date(weekStartDate) 
    };
    
    // Add the new task
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    
    // Update charts with consistent historical data
    updateHistoricalDataAndCharts(updatedTasks);
    
    toast({
      title: "Tarefa criada",
      description: "Nova tarefa adicionada com sucesso.",
    });
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
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planejamento Semanal</h2>
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
      
      <TaskList 
        tasks={tasks} 
        onTaskUpdate={handleTaskUpdate} 
        onTaskDelete={handleTaskDelete}
        selectedCause={selectedCause}
      />
      
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
