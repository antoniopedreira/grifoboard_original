
import { Card } from "@/components/ui/card";
import { PCPBreakdown, Task, WeeklyPCPData } from "@/types";
import PCPBarChart from "../PCPBarChart";
import PCPChart from "../PCPChart";
import { useState } from "react";
import TasksCompletionChart from "./TasksCompletionChart";
import TasksByDisciplineChart from "./TasksByDisciplineChart";
import DailyTasksChart from "./DailyTasksChart";

interface DashboardContentProps {
  tasks: Task[];
  pcpData: PCPBreakdown;
  weeklyPCPData: WeeklyPCPData[];
  weekStartDate: Date;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  tasks,
  pcpData,
  weeklyPCPData,
  weekStartDate,
}) => {
  const [selectedCause, setSelectedCause] = useState<string | null>(null);

  const handleCauseSelect = (cause: string) => {
    setSelectedCause(prevCause => prevCause === cause ? null : cause);
  };

  const clearCauseFilter = () => {
    setSelectedCause(null);
  };

  return (
    <div className="space-y-6">
      {/* PCP Charts */}
      <PCPChart 
        pcpData={pcpData} 
        weeklyData={weeklyPCPData}
        tasks={tasks}
        onCauseSelect={handleCauseSelect}
      />
      
      {/* Weekly PCP Bar Chart */}
      <Card className="p-4">
        <h2 className="text-lg font-medium mb-2">Evolução Semanal do PCP</h2>
        <PCPBarChart weeklyData={weeklyPCPData} />
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tasks Completion Status */}
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-2">Status de Conclusão das Tarefas</h2>
          <div className="h-[300px]">
            <TasksCompletionChart tasks={tasks} />
          </div>
        </Card>
        
        {/* Tasks by Discipline */}
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-2">Tarefas por Disciplina</h2>
          <div className="h-[300px]">
            <TasksByDisciplineChart tasks={tasks} />
          </div>
        </Card>
        
        {/* Daily Tasks Distribution */}
        <Card className="p-4 col-span-1 lg:col-span-2">
          <h2 className="text-lg font-medium mb-2">Distribuição Diária de Tarefas</h2>
          <div className="h-[300px]">
            <DailyTasksChart tasks={tasks} weekStartDate={weekStartDate} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
