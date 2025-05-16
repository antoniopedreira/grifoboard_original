
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPBreakdown, Task, WeeklyPCPData } from "@/types";
import { useState } from "react";
import TasksCompletionChart from "./TasksCompletionChart";
import TasksByDisciplineChart from "./TasksByDisciplineChart";
import TasksProgressChart from "./TasksProgressChart";
import TopPerformersChart from "./TopPerformersChart";
import CauseAnalysisChart from "./CauseAnalysisChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, ChartPie } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardContentProps {
  tasks: Task[];
  pcpData: PCPBreakdown;
  weeklyPCPData: WeeklyPCPData[];
  weekStartDate: Date;
}

// Performance filter options
type PerformanceFilterType = 'responsaveis' | 'executantes' | 'equipes' | 'cabos';

const DashboardContent: React.FC<DashboardContentProps> = ({
  tasks,
  pcpData,
  weeklyPCPData,
  weekStartDate,
}) => {
  const [dashboardView, setDashboardView] = useState<"general" | "performance">("general");
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilterType>("responsaveis");

  // Get title based on current filter
  const getPerformanceTitle = () => {
    switch (performanceFilter) {
      case 'responsaveis':
        return 'Top Responsáveis';
      case 'executantes':
        return 'Top Executantes';
      case 'equipes':
        return 'Top Equipes';
      case 'cabos':
        return 'Top Cabos';
      default:
        return 'Top Responsáveis';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="general" 
        className="w-full"
        value={dashboardView}
        onValueChange={(value) => setDashboardView(value as any)}
      >
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <ChartPie className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            <span>Desempenho</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="general" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* PCP Progress Chart */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Progresso do PCP</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TasksProgressChart weeklyPCPData={weeklyPCPData} />
              </CardContent>
            </Card>

            {/* Tasks Completion Status */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Status de Conclusão</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TasksCompletionChart tasks={tasks} />
              </CardContent>
            </Card>
            
            {/* Tasks by Discipline */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tarefas por Disciplina</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TasksByDisciplineChart tasks={tasks} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Desempenho */}
        <TabsContent value="performance" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Performers with Filter */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2 flex flex-row justify-between items-center">
                <CardTitle className="text-lg">{getPerformanceTitle()}</CardTitle>
                <Select 
                  value={performanceFilter} 
                  onValueChange={(value) => setPerformanceFilter(value as PerformanceFilterType)}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="responsaveis">Responsáveis</SelectItem>
                    <SelectItem value="executantes">Executantes</SelectItem>
                    <SelectItem value="equipes">Equipes</SelectItem>
                    <SelectItem value="cabos">Cabos</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-[350px]">
                <TopPerformersChart 
                  tasks={tasks} 
                  filterType={performanceFilter}
                />
              </CardContent>
            </Card>

            {/* Cause Analysis */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Análise de Causas</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <CauseAnalysisChart tasks={tasks} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardContent;
