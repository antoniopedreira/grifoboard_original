
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import PCPChart from "@/components/PCPChart";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { calculatePCP, generateMockTasks } from "@/utils/pcp";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks());
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const pcpData = calculatePCP(tasks);
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task.id === updatedTask.id ? updatedTask : task)
    );
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
      completionStatus: newTaskData.completionStatus || "not_completed" // Use the provided completionStatus or default to "not_completed"
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    toast({
      title: "Tarefa criada",
      description: "Nova tarefa adicionada com sucesso.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Planejamento Semanal</h2>
          <Button onClick={() => setIsFormOpen(true)}>Nova Tarefa</Button>
        </div>
        
        <PCPChart pcpData={pcpData} />
        
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
