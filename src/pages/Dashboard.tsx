
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PCPBarChart from "@/components/PCPBarChart";
import PCPOverallCard from "@/components/chart/PCPOverallCard";
import PCPBreakdownCard from "@/components/chart/PCPBreakdownCard";
import TaskCompletionChart from "@/components/chart/TaskCompletionChart";
import WeekStatusChart from "@/components/chart/WeekStatusChart";
import { getWeekStartDate } from "@/utils/pcp";

const Dashboard = () => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const weekStartDate = useMemo(() => getWeekStartDate(new Date()), []);
  
  // Use the useTaskManager hook to get task data
  const { 
    pcpData, 
    weeklyPCPData, 
    tasks, 
    allTasks, 
    isLoading 
  } = useTaskManager(weekStartDate);

  // Redirect if no active obra
  useEffect(() => {
    if (!userSession.obraAtiva) {
      navigate("/obras");
    }
  }, [userSession.obraAtiva, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[80vh]">
      <div className="text-xl">Carregando dados...</div>
    </div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Análise de desempenho da obra: {userSession.obraAtiva?.nome_obra}
        </p>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        
        {/* Aba de Resumo */}
        <TabsContent value="summary" className="space-y-6">
          {/* PCP Geral e outros indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PCPOverallCard data={pcpData.overall} />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Total de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">{tasks.length}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tarefas na semana atual
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Disciplinas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">
                  {Object.keys(pcpData.byDiscipline || {}).length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Disciplinas em execução
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Responsáveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">
                  {Object.keys(pcpData.byResponsible || {}).length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Responsáveis envolvidos
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficos de Status Semanal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>PCP Semanal</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <PCPBarChart weeklyData={weeklyPCPData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status da Semana</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <WeekStatusChart tasks={tasks} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Aba de Tendências */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução do PCP</CardTitle>
              </CardHeader>
              <CardContent>
                <PCPBarChart weeklyData={weeklyPCPData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conclusão de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskCompletionChart tasks={allTasks} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px]">
                  {/* Placeholder para gráfico futuro */}
                  <div className="flex justify-center items-center h-full">
                    <p className="text-muted-foreground">
                      Dados insuficientes para análise por setor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Aba de Detalhes */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PCPBreakdownCard title="PCP por Disciplina" data={pcpData.byDiscipline || {}} />
            <PCPBreakdownCard title="PCP por Responsável" data={pcpData.byResponsible || {}} />
            <PCPBreakdownCard title="PCP por Setor" data={pcpData.bySector || {}} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
