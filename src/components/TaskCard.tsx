import { Task } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MoreHorizontal,
  CalendarDays,
  Users,
  Copy,
  Trash2,
  ArrowRightCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
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

  // Status visual logic
  const isDone = task.isFullyCompleted;
  const hasIssue = !!task.causeIfNotDone;

  // Status Colors
  const statusColor = isDone ? "bg-green-500" : hasIssue ? "bg-red-500" : "bg-secondary"; // Dourado para "Em andamento"

  // Days Visualizer (Mini Timeline)
  const days = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

  const getDayStatus = (day: string) => {
    // @ts-ignore - Index access
    const status = task[day];
    if (status === "concluido") return "bg-green-500";
    if (status === "nao_concluido") return "bg-red-400";
    if (status === "programado") return "bg-secondary/60";
    if (status === "chuva") return "bg-blue-400";
    return "bg-slate-100"; // Sem atividade
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.005, y: -2 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group relative bg-white rounded-xl shadow-sm border border-border/60 overflow-hidden hover:shadow-lg transition-all duration-300",
          isDone ? "opacity-80 hover:opacity-100" : "",
        )}
      >
        {/* Barra lateral de status */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", statusColor)} />

        <div className="pl-6 pr-4 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          {/* Informações Principais */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-200 bg-slate-50">
                {task.sector}
              </Badge>
              {task.discipline && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold text-secondary border-secondary/20 bg-secondary/5"
                >
                  {task.discipline}
                </Badge>
              )}
              {isDone && (
                <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
                </Badge>
              )}
              {hasIssue && (
                <Badge className="bg-red-100 text-red-700 border-none text-[10px]">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {task.causeIfNotDone}
                </Badge>
              )}
            </div>

            <h3
              onClick={() => setIsEditOpen(true)}
              className="text-base font-bold text-primary hover:text-secondary cursor-pointer transition-colors line-clamp-1"
            >
              {task.description}
            </h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5" title="Responsável">
                <Users className="w-3.5 h-3.5 text-secondary" />
                <span className="font-medium text-primary/80">{task.responsible || "Sem resp."}</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5" title="Equipe">
                <span className="font-medium">{task.team || "Equipe geral"}</span>
              </div>
            </div>
          </div>

          {/* Timeline de Dias (Visual) */}
          <div className="flex items-center gap-1">
            {days.map((day) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">{day.charAt(0)}</span>
                <div
                  className={cn(
                    "w-6 h-8 rounded-md transition-colors border border-transparent",
                    getDayStatus(day),
                    // @ts-ignore
                    task[day] !== "" ? "border-black/5 shadow-sm" : "",
                  )}
                  title={`${day.toUpperCase()}: ${task[day] || "Sem atividade"}`}
                />
              </div>
            ))}
          </div>

          {/* Menu de Ações */}
          <div className="flex items-center md:border-l md:border-border md:pl-4">
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
                  Editar Tarefa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(task)} className="cursor-pointer">
                  <Copy className="mr-2 h-4 w-4 text-slate-500" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopyToNextWeek(task)} className="cursor-pointer">
                  <ArrowRightCircle className="mr-2 h-4 w-4 text-secondary" /> Mover p/ próx. semana
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 focus:text-red-700 cursor-pointer"
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
