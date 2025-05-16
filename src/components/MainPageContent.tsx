
import { useState, useEffect } from "react";
import TaskForm from "@/components/TaskForm";
import WeekNavigation from "@/components/WeekNavigation";
import RegistryDialog from "@/components/RegistryDialog";
import { getPreviousWeekDates, getNextWeekDates, getWeekStartDate } from "@/utils/pcp";
import { useToast } from "@/hooks/use-toast";
import { useTaskManager } from "@/hooks/useTaskManager";
import MainHeader from "@/components/MainHeader";
import PCPSection from "@/components/PCPSection";
import TasksSection from "@/components/TasksSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardContent from "./dashboard/DashboardContent";
import { LayoutDashboard, LayoutList } from "lucide-react";
import { useLocation } from "react-router-dom";

const MainPageContent = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<string | null>(null);
  
  // Check if dashboard tab is active from URL query params
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') === 'dashboard' ? 'dashboard' : 'tarefas';
  const [activeTab, setActiveTab] = useState<"tarefas" | "dashboard">(defaultTab as any);
  
  // Initialize with the current week's Monday
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState(new Date());

  // Calcular data de fim da semana quando a data de início mudar
  useEffect(() => {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    setWeekEndDate(endDate);
  }, [weekStartDate]);

  // Hook personalizado para gerenciar tarefas
  const {
    tasks,
    isLoading,
    pcpData,
    weeklyPCPData,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskCreate,
    handleTaskDuplicate
  } = useTaskManager(weekStartDate);
  
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
  
  const clearCauseFilter = () => {
    setSelectedCause(null);
  };
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 bg-background">
      {/* Header com título e botões */}
      <MainHeader 
        onNewTaskClick={() => setIsFormOpen(true)}
        onRegistryClick={() => setIsRegistryOpen(true)}
      />
      
      {/* Week Navigation */}
      <WeekNavigation
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        onPreviousWeek={navigateToPreviousWeek}
        onNextWeek={navigateToNextWeek}
      />

      {/* Tabs for navigation */}
      <Tabs 
        defaultValue="tarefas" 
        className="mt-6"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "tarefas" | "dashboard")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            <span>Tarefas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tarefas" className="space-y-6">
          {/* PCP Section com gráficos e filtro ativo */}
          <PCPSection 
            pcpData={pcpData}
            weeklyPCPData={weeklyPCPData}
            tasks={tasks}
            selectedCause={selectedCause}
            onCauseSelect={handleCauseSelect}
            onClearFilter={clearCauseFilter}
          />
          
          {/* Tasks Section com lista de tarefas */}
          <TasksSection 
            tasks={tasks}
            isLoading={isLoading}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskDuplicate={handleTaskDuplicate}
            selectedCause={selectedCause}
          />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <DashboardContent 
            tasks={tasks}
            pcpData={pcpData}
            weeklyPCPData={weeklyPCPData}
            weekStartDate={weekStartDate}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <TaskForm 
        onTaskCreate={handleTaskCreate} 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        currentWeekStartDate={weekStartDate}
      />

      <RegistryDialog 
        isOpen={isRegistryOpen} 
        onOpenChange={setIsRegistryOpen} 
      />
    </div>
  );
};

export default MainPageContent;
