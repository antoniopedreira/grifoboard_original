
import { useEffect, useState, useMemo } from 'react';
import { useTaskManager } from '@/hooks/useTaskManager';
import { getWeekStartDate } from '@/utils/pcp';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PCPOverallCard from '@/components/chart/PCPOverallCard';
import PCPRankingCard from '@/components/chart/PCPRankingCard';
import PCPWeeklyCard from '@/components/chart/PCPWeeklyCard';
import PCPBreakdownCard from '@/components/chart/PCPBreakdownCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const currentDate = new Date();
  const [weekStartDate] = useState(getWeekStartDate(currentDate));
  const { pcpData, allTasks, isLoading, weeklyPCPData } = useTaskManager(weekStartDate);

  // Set document title only once
  useEffect(() => {
    document.title = 'Dashboard PCP';
  }, []);

  // Memoize the dashboard content to prevent unnecessary rerenders
  const dashboardContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8 h-64">
          <p className="text-lg text-gray-500">Carregando dados...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard PCP</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Top metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Overall PCP */}
              <PCPOverallCard data={pcpData.overall} />
              
              {/* Tasks count by status */}
              <Card className="col-span-1 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Tarefas por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Concluídas:</span>
                      <span className="font-medium text-green-600">{pcpData.overall.completedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Não concluídas:</span>
                      <span className="font-medium text-amber-500">
                        {pcpData.overall.totalTasks - pcpData.overall.completedTasks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{pcpData.overall.totalTasks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weekly PCP Data */}
              <PCPWeeklyCard weeklyData={weeklyPCPData} />
            </div>
            
            {/* Middle row with breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <PCPBreakdownCard title="PCP por Disciplina" data={pcpData.byDiscipline} />
              <PCPBreakdownCard title="PCP por Setor" data={pcpData.bySector} />
              <PCPBreakdownCard title="PCP por Responsável" data={pcpData.byResponsible} />
            </div>
          </TabsContent>
          
          <TabsContent value="rankings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PCPRankingCard title="Ranking por Responsável" dataKey="byResponsible" pcpData={pcpData} />
              <PCPRankingCard title="Ranking por Equipe" dataKey="byTeam" pcpData={pcpData} />
              <PCPRankingCard title="Ranking por Executante" dataKey="byExecutor" pcpData={pcpData} />
              <PCPRankingCard title="Ranking por Cabo" dataKey="byCable" pcpData={pcpData} />
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Tendência de PCP por Semana</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PCPWeeklyCard weeklyData={weeklyPCPData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }, [isLoading, pcpData, weeklyPCPData]);

  return dashboardContent;
};

export default Dashboard;
