
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DayOfWeek, Task, TaskStatus } from "@/types";
import { dayNameMap, getStatusColor } from "@/utils/pcp";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
}

// Standard causes list
const standardCauses = [
  "Absenteísmo",
  "Chuva",
  "Equipe produzindo abaixo do planejado",
  "Equipe trabalhando em outra obra",
  "Erro no planejamento",
  "Falta de comunicação",
  "Falta de equipamento",
  "Falta de liberação dos espaços",
  "Falta de mão de abra (atraso na contratação)",
  "Falta de mão de obra",
  "Falta de material",
  "Falta de planejamento de compra",
  "Falta de projeto",
  "Indefinição Engenharia",
  "Material distribuido em quant. Insuficiente",
  "Material incorreto",
  "Material solicitado em qt insuficiente",
  "Mau dimensionamento da equipe",
  "Modificação de projeto",
  "Monitoramento de quant. de material em estoque",
  "Mudança do plano de ataque",
  "Pacote de trabalho grande",
  "Predecessora concluída fora de prazo",
  "Presença de água",
  "Quebra/Manutenção de equipamento",
  "Relocação da mão de obra",
  "Retrabalho",
  "Sem disponibilidade",
  "Vento"
];

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

  const handleCompletionStatusChange = () => {
    const newCompletionStatus = task.completionStatus === "completed" ? "not_completed" : "completed";
    
    onTaskUpdate({
      ...task,
      completionStatus: newCompletionStatus,
    });
  };

  const handleCauseSave = () => {
    onTaskUpdate({
      ...task,
      causeIfNotDone: causeText
    });
    setIsDialogOpen(false);
  };

  const handleCauseSelect = (cause: string) => {
    setCauseText(cause);
    onTaskUpdate({
      ...task,
      causeIfNotDone: cause
    });
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
          <Badge 
            className={`cursor-pointer ${
              task.completionStatus === "completed" 
                ? "bg-green-500 hover:bg-green-600" 
                : "text-orange-500 border-orange-500 hover:bg-orange-100"
            }`}
            variant={task.completionStatus === "completed" ? "default" : "outline"}
            onClick={handleCompletionStatusChange}
          >
            {task.completionStatus === "completed" ? "Concluída" : "Não Concluída"}
          </Badge>
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
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          {task.completionStatus !== "completed" ? (
            <div className="flex gap-2">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Causas Padrão
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[200px] overflow-y-auto">
                  {standardCauses.map(cause => (
                    <DropdownMenuItem 
                      key={cause} 
                      onClick={() => handleCauseSelect(cause)}
                    >
                      {cause}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
