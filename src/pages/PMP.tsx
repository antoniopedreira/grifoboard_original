import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  CalendarRange,
  GripVertical,
  User,
  Calendar as CalendarIcon,
  CheckCircle2, // Icone de Concluido
  Circle, // Icone de Pendente
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  format,
  addDays,
  differenceInWeeks,
  parseISO,
  startOfWeek,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  isValid,
} from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DropAnimation,
  defaultDropAnimationSideEffects,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// --- CONFIGURAÇÃO DE CORES ---
const POSTIT_COLORS = {
  yellow: { border: "border-l-yellow-400", bg: "bg-white", text: "text-slate-700" },
  green: { border: "border-l-emerald-500", bg: "bg-white", text: "text-slate-700" },
  blue: { border: "border-l-blue-500", bg: "bg-white", text: "text-slate-700" },
  red: { border: "border-l-red-500", bg: "bg-white", text: "text-slate-700" },
  purple: { border: "border-l-purple-500", bg: "bg-white", text: "text-slate-700" },
  orange: { border: "border-l-orange-500", bg: "bg-white", text: "text-slate-700" },
};

type ColorKey = keyof typeof POSTIT_COLORS;

interface PmpAtividade {
  id: string;
  obra_id: string;
  semana_referencia: string;
  titulo: string;
  cor: string;
  data_inicio?: string | null;
  data_termino?: string | null;
  responsavel?: string | null;
  concluido?: boolean; // Novo campo
}

// --- CARD (Draggable) ---
const KanbanCard = ({
  atividade,
  weekId,
  onDelete,
  onToggleCheck, // Nova função
  onClick,
  isOverlay = false,
}: {
  atividade: PmpAtividade;
  weekId: string;
  onDelete?: (id: string) => void;
  onToggleCheck?: (id: string, currentStatus: boolean) => void;
  onClick?: (atividade: PmpAtividade) => void;
  isOverlay?: boolean;
}) => {
  const uniqueDragId = `${atividade.id}::${weekId}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueDragId,
    data: { atividade, originWeekId: weekId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const theme = POSTIT_COLORS[atividade.cor as ColorKey] || POSTIT_COLORS.yellow;
  const isCompleted = atividade.concluido;

  const cardClasses = `
    relative group select-none p-3 rounded-md 
    border border-slate-200 border-l-[4px] ${theme.border}
    bg-white shadow-sm hover:shadow-md transition-all duration-200
    flex flex-col gap-2 cursor-grab active:cursor-grabbing
    ${isCompleted ? "opacity-75 bg-slate-50" : ""} 
  `;

  const dateDisplay =
    atividade.data_inicio && atividade.data_termino
      ? `${format(parseISO(atividade.data_inicio), "dd/MM")} - ${format(parseISO(atividade.data_termino), "dd/MM")}`
      : null;

  if (isOverlay) {
    return (
      <div className={`${cardClasses} w-[280px] z-[9999] rotate-2 scale-105 shadow-xl`}>
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-slate-400 mt-0.5" />
          <p className="text-sm font-medium text-slate-700 leading-snug">{atividade.titulo}</p>
        </div>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[100px] w-full rounded-md border-2 border-dashed border-slate-300 bg-slate-50 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(atividade)}
      className={cardClasses}
    >
      {/* Cabeçalho do Card com Check e Título */}
      <div className="flex items-start gap-2">
        {/* Botão de Check */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleCheck) onToggleCheck(atividade.id, !!isCompleted);
          }}
          className={`mt-0.5 transition-colors ${isCompleted ? "text-green-500" : "text-slate-300 hover:text-slate-400"}`}
        >
          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <div className="flex-1">
          <p
            className={`text-sm font-medium leading-snug break-words ${isCompleted ? "text-slate-500 line-through decoration-slate-400" : "text-slate-700"}`}
          >
            {atividade.titulo}
          </p>

          {/* Badge de Concluído */}
          {isCompleted && (
            <Badge
              variant="outline"
              className="mt-1 text-[10px] h-5 bg-green-50 text-green-700 border-green-200 px-1.5"
            >
              CONCLUÍDO
            </Badge>
          )}
        </div>

        {/* Grip para arrastar (visible on hover) */}
        <div className="mt-0.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          {dateDisplay && (
            <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              <CalendarIcon className="h-3 w-3" />
              <span>{dateDisplay}</span>
            </div>
          )}
        </div>

        {atividade.responsavel && (
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded max-w-[50%]">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{atividade.responsavel}</span>
          </div>
        )}
      </div>

      {onDelete && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(atividade.id);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// --- COLUNA (Droppable) ---
const KanbanColumn = ({ weekId, children }: { weekId: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: weekId,
    data: { type: "Column", weekId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col gap-2 min-h-[150px] rounded-lg p-2 transition-colors duration-200
        ${isOver ? "bg-slate-100 ring-2 ring-primary/20" : "bg-transparent"}
      `}
    >
      {children}
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
const PMP = () => {
  const { userSession } = useAuth();
  const obraAtiva = userSession?.obraAtiva;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    cor: "yellow" as ColorKey,
    responsavel: "",
    data_inicio: "",
    data_termino: "",
  });

  const [activeDragItem, setActiveDragItem] = useState<PmpAtividade | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const weeks = useMemo(() => {
    const obra = obraAtiva as any;
    if (!obra?.data_inicio || !obra?.data_termino) return [];

    const start = parseISO(obra.data_inicio);
    const end = parseISO(obra.data_termino);
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 0 });
    const totalWeeks = Math.max(differenceInWeeks(end, firstWeekStart) + 2, 1);

    const weeksArray = [];
    for (let i = 0; i < totalWeeks; i++) {
      const currentWeekStart = addDays(firstWeekStart, i * 7);
      const currentWeekEnd = addDays(currentWeekStart, 6);
      const weekId = format(currentWeekStart, "yyyy-MM-dd");

      weeksArray.push({
        id: weekId,
        label: `Semana ${i + 1}`,
        year: format(currentWeekStart, "yyyy"),
        start: currentWeekStart,
        end: currentWeekEnd,
        formattedRange: `${format(currentWeekStart, "dd/MM")} - ${format(currentWeekEnd, "dd/MM")}`,
      });
    }
    return weeksArray;
  }, [obraAtiva]);

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["pmp_atividades", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      const { data, error } = await supabase
        .from("pmp_atividades" as any)
        .select("*")
        .eq("obra_id", obraAtiva.id)
        .order("concluido", { ascending: true }) // Tarefas não concluídas aparecem primeiro
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  const getTasksForWeek = (weekStart: Date, weekEnd: Date) => {
    return atividades.filter((atividade) => {
      if (!atividade.data_inicio || !atividade.data_termino) {
        return atividade.semana_referencia === format(weekStart, "yyyy-MM-dd");
      }
      const taskStart = parseISO(atividade.data_inicio);
      const taskEnd = parseISO(atividade.data_termino);

      if (!isValid(taskStart) || !isValid(taskEnd)) return false;

      return areIntervalsOverlapping(
        { start: taskStart, end: taskEnd },
        { start: weekStart, end: weekEnd },
        { inclusive: true },
      );
    });
  };

  // --- MUTATIONS ---

  const moveMutation = useMutation({
    mutationFn: async ({ id, newDataInicio, newDataTermino, novaSemanaRef }: any) => {
      const { error } = await supabase
        .from("pmp_atividades" as any)
        .update({
          data_inicio: newDataInicio,
          data_termino: newDataTermino,
          semana_referencia: novaSemanaRef,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
    },
    onError: () => toast({ title: "Erro ao mover", variant: "destructive" }),
  });

  // Mutação para dar Check/Uncheck
  const toggleCheckMutation = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: boolean }) => {
      const { error } = await supabase
        .from("pmp_atividades" as any)
        .update({ concluido: novoStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, novoStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
      const previousData = queryClient.getQueryData(["pmp_atividades", obraAtiva?.id]);

      queryClient.setQueryData(["pmp_atividades", obraAtiva?.id], (old: PmpAtividade[] | undefined) => {
        if (!old) return [];
        return old.map((t) => (t.id === id ? { ...t, concluido: novoStatus } : t));
      });
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["pmp_atividades", obraAtiva?.id], context?.previousData);
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId) {
        const { error } = await supabase
          .from("pmp_atividades" as any)
          .update(data)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pmp_atividades" as any).insert({
          obra_id: obraAtiva.id,
          ...data,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      handleCloseModal();
      toast({ title: editingId ? "Atividade atualizada" : "Atividade criada" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pmp_atividades" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      toast({ title: "Removido!" });
    },
  });

  // --- HANDLERS ---

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.atividade) {
      setActiveDragItem(event.active.data.current.atividade as PmpAtividade);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeData = active.data.current;
    const draggedTask = activeData?.atividade as PmpAtividade;
    const originWeekId = activeData?.originWeekId as string;

    let targetWeekId = "";

    if (over.data.current?.type === "Column") {
      targetWeekId = over.data.current.weekId;
    } else if (over.data.current?.type === "Card") {
      // Se soltar em card, ignora por simplicidade ou implementa lógica complexa de reordenação
      return;
    }

    if (targetWeekId && draggedTask && originWeekId && targetWeekId !== originWeekId) {
      const originDate = parseISO(originWeekId);
      const targetDate = parseISO(targetWeekId);
      const daysDiff = differenceInCalendarDays(targetDate, originDate);

      let newDataInicio = null;
      let newDataTermino = null;

      if (draggedTask.data_inicio && draggedTask.data_termino) {
        newDataInicio = addDays(parseISO(draggedTask.data_inicio), daysDiff).toISOString();
        newDataTermino = addDays(parseISO(draggedTask.data_termino), daysDiff).toISOString();
      } else {
        newDataInicio = targetDate.toISOString();
        newDataTermino = addDays(targetDate, 5).toISOString();
      }

      moveMutation.mutate({
        id: draggedTask.id,
        newDataInicio,
        newDataTermino,
        novaSemanaRef: targetWeekId,
      });
    }
  };

  const handleOpenAdd = (weekId: string) => {
    setEditingId(null);
    setFormData({
      titulo: "",
      cor: "yellow",
      responsavel: "",
      data_inicio: weekId,
      data_termino: addDays(parseISO(weekId), 5).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (atividade: PmpAtividade) => {
    setEditingId(atividade.id);
    setFormData({
      titulo: atividade.titulo,
      cor: atividade.cor as ColorKey,
      responsavel: atividade.responsavel || "",
      data_inicio: atividade.data_inicio ? atividade.data_inicio.split("T")[0] : atividade.semana_referencia,
      data_termino: atividade.data_termino ? atividade.data_termino.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSaveForm = () => {
    if (!formData.titulo) return toast({ title: "Título obrigatório", variant: "destructive" });

    const semanaRef = formData.data_inicio || format(new Date(), "yyyy-MM-dd");

    saveMutation.mutate({
      titulo: formData.titulo,
      cor: formData.cor,
      responsavel: formData.responsavel,
      data_inicio: formData.data_inicio || null,
      data_termino: formData.data_termino || null,
      semana_referencia: semanaRef,
    });
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  if (!obraAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 bg-slate-50/50">
        <CalendarRange className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-lg font-semibold text-slate-700">Nenhuma obra selecionada</h2>
        <p className="text-sm text-slate-500">Selecione uma obra no menu lateral.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans bg-slate-50/30">
      <div className="flex justify-between items-center px-2 py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            PMP - Planejamento Mestre
          </h1>
          <p className="text-sm text-slate-500">
            {obraAtiva.nome_obra} • {weeks.length} semanas • {atividades.length} atividades
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full flex-1 border border-slate-200 rounded-xl bg-white shadow-sm">
          <div className="flex p-6 gap-4">
            {weeks.map((week) => (
              <div key={week.id} className="flex-shrink-0 w-[280px] flex flex-col gap-3 group/column">
                {/* Header Semana */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{week.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100">
                      {week.year}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span className="capitalize">{week.formattedRange}</span>
                  </div>
                </div>

                {/* Coluna Droppable */}
                <div className="bg-slate-50/50 rounded-lg border border-dashed border-slate-200 p-2 min-h-[150px] transition-colors hover:border-slate-300">
                  <KanbanColumn weekId={week.id}>
                    {getTasksForWeek(week.start, week.end).map((atividade) => (
                      <KanbanCard
                        key={`${atividade.id}::${week.id}`}
                        weekId={week.id}
                        atividade={atividade}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onClick={(item) => handleOpenEdit(item)}
                        onToggleCheck={(id, status) => toggleCheckMutation.mutate({ id, novoStatus: !status })}
                      />
                    ))}
                  </KanbanColumn>

                  <Button
                    variant="ghost"
                    className="w-full mt-2 text-slate-400 hover:text-primary hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 h-9 text-xs transition-all"
                    onClick={() => handleOpenAdd(week.id)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem ? <KanbanCard atividade={activeDragItem} weekId="overlay" isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* MODAL EDITAR/CRIAR */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {editingId ? "Editar Atividade" : "Nova Atividade"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">O que será feito?</label>
              <Input
                placeholder="Descrição da atividade..."
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Início</label>
                <Input
                  type="date"
                  value={formData.data_inicio ? format(parseISO(formData.data_inicio), "yyyy-MM-dd") : ""}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Término</label>
                <Input
                  type="date"
                  value={formData.data_termino ? format(parseISO(formData.data_termino), "yyyy-MM-dd") : ""}
                  onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Responsável</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Quem irá executar?"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Categoria</span>
              <div className="flex flex-wrap gap-3">
                {Object.entries(POSTIT_COLORS).map(([key, value]) => {
                  let bgClass = "bg-slate-200";
                  if (key === "yellow") bgClass = "bg-yellow-400";
                  if (key === "green") bgClass = "bg-emerald-500";
                  if (key === "blue") bgClass = "bg-blue-500";
                  if (key === "red") bgClass = "bg-red-500";
                  if (key === "purple") bgClass = "bg-purple-500";
                  if (key === "orange") bgClass = "bg-orange-500";

                  return (
                    <button
                      key={key}
                      onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                      className={`
                                w-8 h-8 rounded-full border-2 transition-all
                                ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-200" : "border-transparent hover:scale-105"} 
                                ${bgClass}
                            `}
                      title={key}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveForm}
              disabled={saveMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMP;
