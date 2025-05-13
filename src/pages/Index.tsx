import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Task, WeeklyPCPData } from "@/types";
import { 
  calculatePCP, 
  generateMockTasks, 
  formatDateRange,
  getWeekStartDate,
  getPreviousWeekDates,
  getNextWeekDates,
  generateWeeklyPCPData,
  storeHistoricalPCPData
} from "@/utils/pcp";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [weekStartDate, setWeekStartDate] = useState<Date>(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState<Date>(new Date(weekStartDate));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Store historical PCP data for consistency when navigating between weeks
  const historicalDataRef = useRef<Map<string, number>>(new Map());
  
  // Initialize tasks and weekly data when component mounts or week changes
  useEffect(() => {
    // Set end date based on start date
    const endDate = new Date(weekStartDate);
    endDate.setDate(weekStartDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    setWeekEndDate(endDate);
    
    // Generate new tasks for the current week
    const newTasks = generateMockTasks(weekStartDate);
    setTasks(newTasks);
    
    // Calculate PCP for the current week's tasks
    const pcpData = calculatePCP(newTasks);
    const currentWeekPCP = Math.round(pcpData.overall.percentage);
    
    // Store the current week's PCP in historical data
    const weekKey = weekStartDate.toISOString().split('T')[0];
    historicalDataRef.current.set(weekKey, currentWeekPCP);
    
    // Generate weekly PCP data with consistent historical values
    setWeeklyPCPData(
      generateWeeklyPCPData(weekStartDate, currentWeekPCP, historicalDataRef.current)
    );
  }, [weekStartDate]);
  
  const pcpData = calculatePCP(tasks);
  
  const updateHistoricalDataAndCharts = (updatedTasks: Task[]) => {
    // Recalculate PCP
    const newPcpData = calculatePCP(updatedTasks);
    const currentWeekPCP = Math.round(newPcpData.overall.percentage);
    
    // Update historical data for current week
    const weekKey = weekStartDate.toISOString().split('T')[0];
    historicalDataRef.current.set(weekKey, currentWeekPCP);
    
    // Update weekly data to match the current week's actual PCP
    setWeeklyPCPData(
      generateWeeklyPCPData(weekStartDate, currentWeekPCP, historicalDataRef.current)
    );
  };
  
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
  
  const currentWeekFormatted = formatDateRange(weekStartDate, weekEndDate);
  const today = new Date();
  const isCurrentWeek = 
    weekStartDate.getTime() <= today.getTime() && 
    today.getTime() <= weekEndDate.getTime();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Planejamento Semanal</h2>
          <Button onClick={() => setIsFormOpen(true)}>Nova Tarefa</Button>
        </div>
        
        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <Button 
            variant="outline" 
            size="icon"
            onClick={navigateToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">
              {currentWeekFormatted}
            </h3>
            {isCurrentWeek && (
              <span className="text-sm text-green-600 font-medium">Semana Atual</span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={navigateToNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
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
      </main>
    </div>
  );
};

export default Index;
