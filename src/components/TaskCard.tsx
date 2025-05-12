
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import { dayNameMap, getStatusColor } from "@/utils/pcp";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [causeText, setCauseText] = useState(task.causeIfNotDone || "");

  const handleStatusChange = (day: DayOfWeek, newStatus: TaskStatus) => {
    const updatedDailyStatus = task.dailyStatus.map(status => 
      status.day === day ? { ...status, status: newStatus } : status
    );

    onTaskUpdate({
      ...task,
      dailyStatus: updatedDailyStatus,
    });
  };

  const handleCompletionStatusChange = (completed: boolean) => {
    onTaskUpdate({
      ...task,
      completionStatus: completed ? "completed" : "not_completed",
    });
  };

  const handleCauseSave = () => {
    onTaskUpdate({
      ...task,
      causeIfNotDone: causeText
    });
    setIsDialogOpen(false);
  };

  // Function to render status button for each day
  const renderStatusButton = (day: DayOfWeek) => {
    const dayStatus = task.dailyStatus.find(s => s.day === day)?.status || "not_planned";
    const isPlanned = task.plannedDays.includes(day);
    
    if (!isPlanned) {
      return (
        <div className="h-8 w-8 rounded-full bg-gray-200 opacity-30 border border-gray-300" />
      );
    }

    const statusColor = getStatusColor(dayStatus);
    
    return (
      <button
        onClick={() => {
          // Cycle through statuses: planned -> completed -> not_done -> planned
          const nextStatus: Record<TaskStatus, TaskStatus> = {
            planned: "completed",
            completed: "not_done",
            not_done: "planned",
            not_planned: "not_planned"
          };
          handleStatusChange(day, nextStatus[dayStatus]);
        }}
        className={`h-8 w-8 rounded-full ${statusColor} border flex items-center justify-center text-white`}
        aria-label={`Status para ${dayNameMap[day]}: ${dayStatus}`}
      >
        {dayStatus === "completed" && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">{task.description}</h3>
            <p className="text-sm text-gray-500">{task.item}</p>
          </div>
          {task.completionStatus === "completed" ? (
            <Badge className="bg-green-500">Concluída</Badge>
          ) : (
            <Badge variant="outline" className="text-orange-500 border-orange-500">Não Concluída</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Setor</span>
            <span>{task.sector}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Disciplina</span>
            <span>{task.discipline}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Equipe</span>
            <span>{task.team}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Responsável</span>
            <span>{task.responsible}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            {Object.entries(dayNameMap).map(([day, shortName]) => (
              <div key={day} className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">{shortName}</span>
                {renderStatusButton(day as DayOfWeek)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">Status da Tarefa:</span>
          <div className="flex items-center space-x-2">
            <span className={task.completionStatus === "completed" ? "text-gray-400" : "font-medium"}>Não Concluída</span>
            <Switch 
              checked={task.completionStatus === "completed"}
              onCheckedChange={handleCompletionStatusChange}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={task.completionStatus !== "completed" ? "text-gray-400" : "font-medium"}>Concluída</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          {task.completionStatus !== "completed" ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-red-500">
                  {task.causeIfNotDone ? "Editar causa" : "Adicionar causa"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Justificativa de Não Execução</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <Textarea 
                    value={causeText} 
                    onChange={(e) => setCauseText(e.target.value)}
                    placeholder="Informe o motivo da não execução..."
                    className="min-h-[100px]"
                  />
                  <Button onClick={handleCauseSave}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <span />
          )}
          
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
