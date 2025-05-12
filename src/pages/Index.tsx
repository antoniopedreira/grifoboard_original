import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import PCPBarChart from "@/components/PCPBarChart";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Task, WeeklyPCPData } from "@/types";
import { 
  calculatePCP, 
  generateMockTasks, 
  getCurrentWeekDates,
  getPreviousWeekDates,
  getNextWeekDates,
  formatDateRange,
  generateMockWeeklyData,
  getWeekStartDate
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
    
    // Generate or update weekly PCP data
    setWeeklyPCPData(prevData => {
      // Check if we already have data for this week
      const existingWeekIndex = prevData.findIndex(
        week => week.date.getTime() === weekStartDate.getTime()
      );
      
      if (existingWeekIndex === -1) {
        // If this is a new week, generate all data
        return generateMockWeeklyData(weekStartDate, 4);
      } else {
        // Keep existing data
        return prevData;
      }
    });
  }, [weekStartDate]);
  
  const pcpData = calculatePCP(tasks);
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
    
    // Update weekly PCP data for the current week
    const currentWeekFormatted = formatDateRange(weekStartDate, weekEndDate);
    
    // Update PCP percentage in weekly data
    setWeeklyPCPData(prevData => {
      return prevData.map(week => {
        if (week.date.getTime() === weekStartDate.getTime()) {
          return {
            ...week,
            percentage: Math.round(calculatePCP(
              tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
            ).overall.percentage)
          };
        }
        return week;
      });
    });
    
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
      completionStatus: newTaskData.completionStatus || "not_completed", // Use the provided completionStatus or default to "not_completed"
      weekStartDate: new Date(weekStartDate) // Add the current week start date
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    // Update weekly PCP data for the current week
    setWeeklyPCPData(prevData => {
      return prevData.map(week => {
        if (week.date.getTime() === weekStartDate.getTime()) {
          // Recalculate PCP with the new task
          const newTasks = [newTask, ...tasks];
          const newPCP = calculatePCP(newTasks);
          return {
            ...week,
            percentage: Math.round(newPCP.overall.percentage)
          };
        }
        return week;
      });
    });
    
    toast({
      title: "Tarefa criada",
      description: "Nova tarefa adicionada com sucesso.",
    });
  };
  
  const navigateToPreviousWeek = () => {
    const { start, end } = getPreviousWeekDates(weekStartDate);
    setWeekStartDate(start);
  };
  
  const navigateToNextWeek = () => {
    const { start, end } = getNextWeekDates(weekStartDate);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <PCPChart pcpData={pcpData} />
        </div>
        
        {/* Weekly Bar Chart */}
        <div className="mb-8">
          <PCPBarChart weeklyData={weeklyPCPData} />
        </div>
        
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
