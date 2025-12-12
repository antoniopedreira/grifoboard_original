import { Task, DayOfWeek, TaskStatus } from "@/types";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  ArrowRightCircle,
  CalendarDays,
  Package,
  ChevronDown,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState("");

  const isDone = task.isFullyCompleted;
  const hasIssue = !!task.causeIfNotDone;

  // Cores de Status
  const statusColor = isDone ? "bg-green-500" : hasIssue ? "bg-red-500" : "bg-secondary"; // Dourado

  const days: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabels = { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom" };

  const getDailyStatus = (day: DayOfWeek): TaskStatus => {
    return task.dailyStatus?.find((s) => s.day === day)?.status || "planned";
  };

  const handleDayClick = (day: DayOfWeek, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.plannedDays.includes(day)) return;

    const currentStatus = getDailyStatus(day);
    let newStatus: TaskStatus = "planned";

    if (currentStatus === "planned") newStatus = "completed";
    else if (currentStatus === "completed") newStatus = "not_done";
    else if (currentStatus === "not_done") newStatus = "planned";

    const newDailyStatus = task.dailyStatus?.filter((s) => s.day !== day) || [];
    if (newStatus !== "planned") {
      newDailyStatus.push({ day, status: newStatus });
    }

    const allPlannedAreCompleted = task.plannedDays.every((d) => {
      const s = d === day ? newStatus : getDailyStatus(d);
      return s === "completed";
    });

    onUpdate({
      ...task,
      dailyStatus: newDailyStatus,
      isFullyCompleted: allPlannedAreCompleted,
      // Se mudou algo, limpa a causa global se estiver tudo ok
      causeIfNotDone: allPlannedAreCompleted ? undefined : task.causeIfNotDone,
    });
  };

  // Função para alternar status global da tarefa
  const toggleTaskStatus = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDone) {
      // Se estava concluída, volta para "Em andamento" (reseta os dias para planejado)
      onUpdate({
        ...task,
        isFullyCompleted: false,
        dailyStatus: [], // Limpa status diários
        causeIfNotDone: undefined,
      });
    } else if (hasIssue) {
      // Se tinha problema, marca como concluída
      // Define todos os dias planejados como 'completed'
      const allCompleted = task.plannedDays.map((d) => ({ day: d, status: "completed" as TaskStatus }));
      onUpdate({
        ...task,
        isFullyCompleted: true,
        dailyStatus: allCompleted,
        causeIfNotDone: undefined,
      });
    } else {
      // Se estava em andamento, marca como "Não Concluída" (necessita causa)
      // Isso é um atalho visual, idealmente pediria a causa, mas aqui seta um default ou espera o user
      onUpdate({
        ...task,
        causeIfNotDone: "Outros", // Causa padrão temporária para ativar o estado vermelho
      });
    }
  };

  const getDayColor = (day: DayOfWeek) => {
    const isPlanned = task.plannedDays.includes(day);
    if (!isPlanned) return "bg-slate-50 text-slate-300 border-slate-100";

    const status = getDailyStatus(day);

    switch (status) {
      case "completed":
        return "bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600";
      case "not_done":
        return "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600";
      case "not_planned":
        return "bg-slate-200 text-slate-400";
      default:
        return "bg-white border-secondary text-secondary font-bold shadow-sm hover:bg-secondary/10";
    }
  };

  const handleCauseChange = (value: string) => {
    onUpdate({
      ...task,
      causeIfNotDone: value === "none" ? undefined : value,
      isFullyCompleted: false, // Se tem causa, não está 100%
    });
  };

  const defaultCauses = [
    "Chuva",
    "Falta de Material",
    "Falta de Projeto",
    "Falta de Frente",
    "Mão de Obra",
    "Equipamento Quebrado",
    "Outros",
  ];

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group relative bg-white rounded-xl shadow-sm border border-border/60 overflow-hidden hover:shadow-md transition-all duration-300",
          isDone ? "bg-slate-50/50" : "",
        )}
      >
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300", statusColor)} />

        <div className="pl-6 pr-4 py-5 flex flex-col gap-5">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start gap-3">
            <h3
              onClick={() => setIsEditOpen(true)}
              className="text-lg font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer leading-tight flex-1"
            >
              {task.description}
            </h3>

            {/* Botão de Status Global (O botão da imagem 2) */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTaskStatus}
                className={cn(
                  "h-7 px-3 text-xs font-semibold rounded-full border transition-all",
                  isDone
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                    : hasIssue
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300"
                      : "bg-white text-slate-500 border-slate-200 hover:text-primary hover:border-primary/30",
                )}
              >
                {isDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Concluída
                  </>
                ) : hasIssue ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Não Concluída
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Em andamento
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-primary hover:bg-slate-100"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(task)} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" /> Duplicar
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

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Setor</span>
              <span className="text-xs font-semibold text-slate-700 block truncate uppercase">{task.sector}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Disciplina</span>
              <span className="text-xs font-semibold text-slate-700 block truncate uppercase">{task.discipline}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Executante</span>
              <span className="text-xs font-semibold text-slate-700 block truncate uppercase">{task.team || "-"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Responsável</span>
              <span className="text-xs font-semibold text-slate-700 block truncate uppercase">{task.responsible}</span>
            </div>
            {task.executor && (
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Encarregado</span>
                <span className="text-xs font-semibold text-slate-700 block truncate uppercase">{task.executor}</span>
              </div>
            )}
          </div>

          {/* Timeline Interativa */}
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
            {days.map((day) => {
              const isPlanned = task.plannedDays.includes(day);
              return (
                <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                  <span
                    className={cn("text-[9px] uppercase font-bold", isPlanned ? "text-slate-600" : "text-slate-300")}
                  >
                    {dayLabels[day]}
                  </span>
                  <button
                    onClick={(e) => handleDayClick(day, e)}
                    disabled={!isPlanned}
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-all duration-200",
                      getDayColor(day),
                      isPlanned ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default opacity-50",
                    )}
                    title={isPlanned ? "Clique para alterar status" : "Não planejado"}
                  >
                    {task.dailyStatus?.find((s) => s.day === day)?.status === "completed" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                    {task.dailyStatus?.find((s) => s.day === day)?.status === "not_done" && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Rodapé: Materiais e Causa */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            {/* Seção de Materiais (Adicionar Items) */}
            <Collapsible open={isMaterialsOpen} onOpenChange={setIsMaterialsOpen} className="w-full">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-slate-500 hover:text-primary -ml-2 gap-2 group"
                  >
                    <Package className="h-4 w-4 group-hover:text-secondary transition-colors" />
                    <span className="text-xs font-medium">Materiais Necessários</span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
                    <ChevronDown
                      className={cn("h-3 w-3 transition-transform duration-200", isMaterialsOpen ? "rotate-180" : "")}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2 pt-2">
                {/* Lista vazia por enquanto */}
                <div className="text-xs text-muted-foreground p-3 bg-slate-50 rounded border border-slate-100 flex flex-col gap-2">
                  <span className="text-center italic opacity-70">Nenhum material listado</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar material..."
                      className="h-7 text-xs bg-white"
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                    />
                    <Button size="sm" className="h-7 w-7 p-0 bg-secondary hover:bg-secondary/90">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Seletor de Causas e Botões */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select value={task.causeIfNotDone || "none"} onValueChange={handleCauseChange}>
                  <SelectTrigger className="h-9 text-xs border-slate-200 bg-slate-50 hover:bg-white transition-colors focus:ring-0">
                    <SelectValue placeholder="Selecionar causa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-slate-400">
                      Sem causa registrada
                    </SelectItem>
                    {defaultCauses.map((cause) => (
                      <SelectItem key={cause} value={cause}>
                        {cause}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 text-slate-500 hover:text-primary"
                  onClick={() => onDuplicate(task)}
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-slate-200 text-slate-500 hover:text-primary"
                  onClick={() => setIsEditOpen(true)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <EditTaskDialog task={task} isOpen={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  );
};

export default TaskCard;
