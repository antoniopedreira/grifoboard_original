
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Task } from "@/types";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import TaskForm from "@/components/TaskForm";
import WeekNavigation from "@/components/WeekNavigation";
import { Button } from "@/components/ui/button";
import { calculatePCP, getPreviousWeekDates, getNextWeekDates } from "@/utils/pcp";
import { useToast } from "@/components/ui/use-toast";
import { useWeeklyData } from "@/hooks/useWeeklyData";

const MainPageContent = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
  };
  
  const navigateToNextWeek = () => {
    const { start } = getNextWeekDates(weekStartDate);
    setWeekStartDate(start);
  };
  
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planejamento Semanal</h2>
        <Button onClick={() => setIsFormOpen(true)}>Nova Tarefa</Button>
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
      />
      
      <TaskList 
        tasks={tasks} 
        onTaskUpdate={handleTaskUpdate} 
      />
      
      <TaskForm 
        onTaskCreate={handleTaskCreate} 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
      />
    </>
  );
};

export default MainPageContent;
