import { Task, DayOfWeek, TaskStatus } from "@/types";
import { MoreHorizontal, Users, Copy, Trash2, ArrowRightCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import EditTaskDialog from "./task-card/EditTaskDialog";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onCopyToNextWeek: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete, onDuplicate, onCopyToNextWeek }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isDone = task.isFullyCompleted;
  const hasIssue = !!task.causeIfNotDone;

  const statusColor = isDone ? "bg-green-500" : hasIssue ? "bg-red-500" : "bg-secondary";

  const days: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabels = { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom" };

  // Helper para obter o status atual de um dia específico
  const getDailyStatus = (day: DayOfWeek): TaskStatus => {
    return task.dailyStatus?.find((s) => s.day === day)?.status || "planned";
  };

  // Função para mudar o status de um dia ao clicar
  const handleDayClick = (day: DayOfWeek, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!task.plannedDays.includes(day)) {
      return;
    }

    const currentStatus = getDailyStatus(day);
    let newStatus: TaskStatus = "planned";

    // Ciclo: Planejado -> Concluído -> Não Concluído -> Planejado
    if (currentStatus === "planned") newStatus = "completed";
    else if (currentStatus === "completed") newStatus = "not_done";
    else if (currentStatus === "not_done") newStatus = "planned";

    const newDailyStatus = task.dailyStatus?.filter((s) => s.day !== day) || [];
    if (newStatus !== "planned") {
      newDailyStatus.push({ day, status: newStatus });
    }

    // Verifica se todos os dias planejados estão concluídos
    const allPlannedAreCompleted = task.plannedDays.every((d) => {
      const s = d === day ? newStatus : getDailyStatus(d);
      return s === "completed";
    });

    onUpdate({
      ...task,
      dailyStatus: newDailyStatus,
      isFullyCompleted: allPlannedAreCompleted,
    });
  };

  // Define a cor do botão baseado no status
  const getDayColor = (day: DayOfWeek) => {
    const isPlanned = task.plannedDays.includes(day);
    if (!isPlanned) return "bg-slate-100 text-slate-300 border-transparent";

    const status = getDailyStatus(day);

    switch (status) {
      case "completed":
        return "bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600";
      case "not_done":
        return "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600";
      case "not_planned":
        return "bg-slate-200 text-slate-400";
      default:
        return "bg-white border-secondary text-secondary font-bold shadow-sm hover:bg-secondary/10"; // Planejado
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.002, y: -2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative bg-white rounded-xl shadow-sm border border-border/60 overflow-hidden hover:shadow-md transition-all duration-300",
          isDone ? "bg-slate-50/50" : "",
        )}
      >
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300", statusColor)} />

        <div className="pl-5 pr-4 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          {/* Info Principal */}
          <div className="flex-1 space-y-2 min-w-0" onClick={() => setIsEditOpen(true)}>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] font-bold text-slate-500 border-slate-200 bg-slate-50 uppercase tracking-wide"
              >
                {task.sector}
              </Badge>
              {task.discipline && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold text-secondary border-secondary/20 bg-secondary/5 uppercase tracking-wide"
                >
                  {task.discipline}
                </Badge>
              )}
              {isDone && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
                </Badge>
              )}
              {hasIssue && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none text-[10px]">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {task.causeIfNotDone}
                </Badge>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-800 group-hover:text-primary transition-colors cursor-pointer truncate pr-2">
              {task.description}
            </h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 min-w-0" title="Responsável">
                <Users className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                <span className="font-medium text-slate-700 truncate">{task.responsible || "N/A"}</span>
              </div>
              {task.team && (
                <>
                  <div className="w-px h-3 bg-slate-300" />
                  <div className="flex items-center gap-1.5 min-w-0" title="Equipe">
                    <span className="font-medium truncate">{task.team}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline Interativa */}
          <div className="flex items-center gap-1.5 self-start md:self-center bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
            {days.map((day) => {
              const isPlanned = task.plannedDays.includes(day);
              const status = getDailyStatus(day);
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span
                    className={cn("text-[9px] uppercase font-bold", isPlanned ? "text-slate-600" : "text-slate-300")}
                  >
                    {dayLabels[day].charAt(0)}
                  </span>
                  <button
                    onClick={(e) => handleDayClick(day, e)}
                    disabled={!isPlanned}
                    className={cn(
                      "w-7 h-9 rounded-md border flex items-center justify-center transition-all duration-200",
                      // CORREÇÃO: Usando a variável status calculada acima em vez de chamar getDayStatus
                      status === "completed" ? "ring-2 ring-green-100" : "",
                      getDayColor(day),
                      isPlanned
                        ? "cursor-pointer hover:scale-110 active:scale-95"
                        : "cursor-default opacity-40 border-transparent",
                    )}
                    title={
                      isPlanned
                        ? `Clique para alterar status: ${status === "planned" ? "Planejado" : status}`
                        : "Não planejado"
                    }
                  >
                    {status === "completed" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Menu */}
          <div className="flex items-center md:border-l md:border-border md:pl-4 self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                  Editar Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(task)} className="cursor-pointer">
                  <Copy className="mr-2 h-4 w-4 text-slate-500" /> Duplicar Tarefa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyToNextWeek(task)} className="cursor-pointer">
                  <ArrowRightCircle className="mr-2 h-4 w-4 text-secondary" /> Mover p/ próx. semana
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 focus:text-red-700 cursor-pointer hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <EditTaskDialog task={task} isOpen={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  );
};

export default TaskCard;
