import { useState, useMemo, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Trash2,
  CalendarRange,
  GripVertical,
  User,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  AlertCircle,
  Bomb,
  AlarmClock,
  MapPin,
  Settings,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registrosService } from "@/services/registroService";
import {
  format,
  addDays,
  differenceInWeeks,
  parseISO,
  startOfWeek,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  isValid,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

// --- CONFIGURAÇÃO DE CORES DOS POST-ITS ---
const POSTIT_COLORS = {
  yellow: { border: "border-l-yellow-400", bg: "bg-white", text: "text-slate-700", ring: "ring-yellow-400" },
  green: { border: "border-l-emerald-500", bg: "bg-white", text: "text-slate-700", ring: "ring-emerald-500" },
  blue: { border: "border-l-blue-500", bg: "bg-white", text: "text-slate-700", ring: "ring-blue-500" },
  red: { border: "border-l-red-500", bg: "bg-white", text: "text-slate-700", ring: "ring-red-500" },
  purple: { border: "border-l-purple-500", bg: "bg-white", text: "text-slate-700", ring: "ring-purple-500" },
  orange: { border: "border-l-orange-500", bg: "bg-white", text: "text-slate-700", ring: "ring-orange-500" },
  pink: { border: "border-l-pink-500", bg: "bg-white", text: "text-slate-700", ring: "ring-pink-500" },
  cyan: { border: "border-l-cyan-500", bg: "bg-white", text: "text-slate-700", ring: "ring-cyan-500" },
  lime: { border: "border-l-lime-500", bg: "bg-white", text: "text-slate-700", ring: "ring-lime-500" },
  indigo: { border: "border-l-indigo-500", bg: "bg-white", text: "text-slate-700", ring: "ring-indigo-500" },
  amber: { border: "border-l-amber-500", bg: "bg-white", text: "text-slate-700", ring: "ring-amber-500" },
  teal: { border: "border-l-teal-500", bg: "bg-white", text: "text-slate-700", ring: "ring-teal-500" },
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
  concluido?: boolean;
  setor?: string | null;
}

// --- CARD (Draggable) ---
const KanbanCard = ({
  atividade,
  weekId,
  onDelete,
  onToggleCheck,
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

  // Lógica de Atraso no Card
  const today = startOfDay(new Date());
  const endDate = atividade.data_termino ? parseISO(atividade.data_termino) : null;
  const isDelayed = !isCompleted && endDate && isBefore(endDate, today);

  const cardClasses = `
    relative group select-none p-3 rounded-md 
    border border-slate-200 border-l-[4px] 
    ${isDelayed ? "border-l-red-600 bg-red-50/50" : theme.border} 
    ${isCompleted ? "opacity-75 bg-slate-50 border-l-slate-300" : "bg-white"}
    shadow-sm hover:shadow-md transition-all duration-200
    flex flex-col gap-2 cursor-grab active:cursor-grabbing
  `;

  const dateDisplay =
    atividade.data_inicio && atividade.data_termino
      ? `${format(parseISO(atividade.data_inicio), "dd/MM")} - ${format(parseISO(atividade.data_termino), "dd/MM")}`
      : null;

  if (isOverlay) {
    return (
      <div className={`${cardClasses} w-[280px] z-[9999] rotate-2 scale-105 shadow-xl bg-white`}>
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
      <div className="flex items-start gap-2">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleCheck) onToggleCheck(atividade.id, !!isCompleted);
          }}
          className={`mt-0.5 transition-colors ${
            isCompleted ? "text-green-500" : isDelayed ? "text-red-500" : "text-slate-300 hover:text-slate-400"
          }`}
        >
          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug break-words ${isCompleted ? "text-slate-500 line-through decoration-slate-400" : "text-slate-700"}`}
          >
            {atividade.titulo}
          </p>

          <div className="flex flex-wrap gap-1 mt-1">
            {isCompleted && (
              <Badge
                variant="outline"
                className="text-[9px] h-4 bg-green-50 text-green-700 border-green-200 px-1.5 font-bold"
              >
                CONCLUÍDO
              </Badge>
            )}

            {isDelayed && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-bold flex items-center gap-1">
                <AlertCircle className="h-2 w-2" /> ATRASADO
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-0.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100/50">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          {dateDisplay && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${isDelayed ? "bg-red-50 text-red-600 font-medium" : "bg-slate-100 text-slate-600"}`}
            >
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
  const isMobile = useIsMobile();
  const { userSession } = useAuth();
  const obraAtiva = userSession?.obraAtiva;
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    cor: "yellow" as ColorKey,
    responsavel: "",
    data_inicio: "",
    data_termino: "",
    setor: "",
  });

  const [activeDragItem, setActiveDragItem] = useState<PmpAtividade | null>(null);
  const [isSetorModalOpen, setIsSetorModalOpen] = useState(false);
  const [newSetor, setNewSetor] = useState("");
  const [isUploadingPlanta, setIsUploadingPlanta] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Query para buscar setores cadastrados
  const { data: setores = [], refetch: refetchSetores } = useQuery({
    queryKey: ["registros-pmp-setores", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      const registros = await registrosService.listarRegistros(obraAtiva.id);
      return registros.filter((r) => r.tipo === "sector").map((r) => r.valor);
    },
    enabled: !!obraAtiva?.id,
  });

  // Mutation para adicionar setor
  const addSetorMutation = useMutation({
    mutationFn: async (valor: string) => {
      if (!obraAtiva?.id) throw new Error("Nenhuma obra selecionada");
      await registrosService.criarRegistro({
        obra_id: obraAtiva.id,
        tipo: "sector",
        valor: valor.trim(),
      });
    },
    onSuccess: () => {
      refetchSetores();
      setNewSetor("");
      setIsSetorModalOpen(false);
      toast({ title: "Setor cadastrado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao cadastrar setor", variant: "destructive" });
    },
  });

  // Função para upload da planta/imagem
  const handlePlantaUpload = async (file: File) => {
    if (!obraAtiva?.id) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPEG, PNG ou WebP", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingPlanta(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `pmp-planta-${obraAtiva.id}.${fileExt}`;
      const filePath = `${obraAtiva.id}/${fileName}`;

      // Se já existe imagem, deletar a antiga
      if (obraAtiva.pmp_planta_url) {
        const oldPath = obraAtiva.pmp_planta_url.split("/").slice(-2).join("/");
        await supabase.storage.from("diario-obra").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("diario-obra")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("diario-obra").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("obras")
        .update({ pmp_planta_url: urlData.publicUrl })
        .eq("id", obraAtiva.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    } finally {
      setIsUploadingPlanta(false);
    }
  };

  // Função para remover planta
  const handleRemovePlanta = async () => {
    if (!obraAtiva?.id || !obraAtiva.pmp_planta_url) return;

    setIsUploadingPlanta(true);
    try {
      const oldPath = obraAtiva.pmp_planta_url.split("/").slice(-2).join("/");
      await supabase.storage.from("diario-obra").remove([oldPath]);

      const { error } = await supabase.from("obras").update({ pmp_planta_url: null }).eq("id", obraAtiva.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast({ title: "Imagem removida!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao remover imagem", variant: "destructive" });
    } finally {
      setIsUploadingPlanta(false);
    }
  };

  // Lógica da Bomba Relógio
  const { daysRemaining, urgencyBg, urgencyBorder, urgencyText, iconColor, statusLabel, isExploded } = useMemo(() => {
    if (!obraAtiva?.data_termino)
      return {
        daysRemaining: null,
        urgencyBg: "",
        urgencyBorder: "",
        urgencyText: "",
        iconColor: "",
        statusLabel: "",
        isExploded: false,
      };

    const end = parseISO(obraAtiva.data_termino);
    const today = startOfDay(new Date());
    const days = differenceInCalendarDays(end, today);

    // Configuração Padrão: Estilo Alerta Vermelho
    let styles = {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-500",
      label: "CONTAGEM REGRESSIVA",
      exploded: false,
    };

    if (days < 0) {
      // Estourou o prazo
      styles = {
        bg: "bg-red-600",
        border: "border-red-700",
        text: "text-white",
        icon: "text-white animate-bounce",
        label: "PRAZO ESTOURADO!",
        exploded: true,
      };
    } else if (days <= 14) {
      // Urgente (menos de 2 semanas)
      styles = {
        bg: "bg-red-100",
        border: "border-red-400",
        text: "text-red-800",
        icon: "text-red-600 animate-pulse",
        label: "PRAZO CRÍTICO",
        exploded: false,
      };
    } else {
      // "Normal", mas com design de alerta
      styles = {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
        icon: "text-orange-600",
        label: "TEMPO RESTANTE",
        exploded: false,
      };
    }

    return {
      daysRemaining: days,
      urgencyBg: styles.bg,
      urgencyBorder: styles.border,
      urgencyText: styles.text,
      iconColor: styles.icon,
      statusLabel: styles.label,
      isExploded: styles.exploded,
    };
  }, [obraAtiva]);

  const weeks = useMemo(() => {
    const obra = obraAtiva as any;
    if (!obra?.data_inicio || !obra?.data_termino) return [];

    const start = parseISO(obra.data_inicio);
    const end = parseISO(obra.data_termino);

    // DEFINIÇÃO: A semana começa na SEGUNDA-FEIRA (weekStartsOn: 1)
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 });

    const totalWeeks = Math.max(differenceInWeeks(end, firstWeekStart) + 2, 1);

    const weeksArray = [];
    for (let i = 0; i < totalWeeks; i++) {
      const currentWeekStart = addDays(firstWeekStart, i * 7);
      const currentWeekEnd = addDays(currentWeekStart, 6); // Se começou segunda, termina no domingo (+6 dias)
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
        .order("concluido", { ascending: true })
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
        .update({ data_inicio: newDataInicio, data_termino: newDataTermino, semana_referencia: novaSemanaRef })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] }),
    onError: () => toast({ title: "Erro ao mover", variant: "destructive" }),
  });

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
    onSuccess: async (_data, variables) => {
      const userId = userSession?.user?.id;
      if (!userId) return;

      if (variables.novoStatus) {
        // Tarefa concluída - dar 50 XP
        await gamificationService.awardXP(userId, "PMP_ATIVIDADE_CONCLUIDA", 50, variables.id);
      } else {
        // Tarefa desmarcada - remover XP
        await gamificationService.removeXP(userId, "PMP_ATIVIDADE_CONCLUIDA", 50, variables.id);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] }),
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
        const { error } = await supabase.from("pmp_atividades" as any).insert({ obra_id: obraAtiva.id, ...data });
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
    if (event.active.data.current?.atividade) setActiveDragItem(event.active.data.current.atividade as PmpAtividade);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;
    const activeData = active.data.current;
    const draggedTask = activeData?.atividade as PmpAtividade;
    const originWeekId = activeData?.originWeekId as string;
    let targetWeekId = "";
    if (over.data.current?.type === "Column") targetWeekId = over.data.current.weekId;
    else if (over.data.current?.type === "Card") return;
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
      moveMutation.mutate({ id: draggedTask.id, newDataInicio, newDataTermino, novaSemanaRef: targetWeekId });
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
      setor: "",
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
      setor: atividade.setor || "",
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
      setor: formData.setor || null,
    });
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  if (!obraAtiva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800">Nenhuma obra selecionada</h2>
          <p className="text-slate-600">Selecione uma obra para continuar.</p>
          <button
            onClick={() => navigate("/obras")}
            className="px-6 py-3 bg-[#C7A347] text-white rounded-xl font-semibold hover:bg-[#B7943F] transition-colors"
          >
            Selecionar Obra
          </button>
        </div>
      </div>
    );
  }

  // Mobile: estrutura diferente para melhor UX
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-slate-50/30">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handlePlantaUpload(file);
            e.target.value = "";
          }}
        />
        {/* LISTA DE SEMANAS MOBILE - Scroll Vertical (inclui header e bomba) */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto pb-32">
            {/* HEADER MOBILE: Dentro do scroll */}
            <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-primary" />
                PMP - Planejamento Mestre
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {obraAtiva.nome_obra} • {weeks.length} semanas • {atividades.length} atividades
              </p>
            </div>

            {/* BOMBA RELÓGIO MOBILE - Dentro do scroll */}
            {daysRemaining !== null && (
              <div
                className={`mx-4 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${urgencyBg} ${urgencyBorder} shadow-sm`}
              >
                <div className={`relative p-2 rounded-full bg-white/20 border-2 border-current ${iconColor}`}>
                  <Bomb className={`h-5 w-5 ${isExploded ? "animate-bounce" : "animate-pulse"}`} />
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${urgencyText}`}>
                    {statusLabel}
                  </span>
                  <div className={`text-xl font-black font-mono leading-none flex items-center gap-1 ${urgencyText}`}>
                    {daysRemaining < 0 ? (
                      <span>ATRASO {Math.abs(daysRemaining)}D</span>
                    ) : daysRemaining === 0 ? (
                      "VENCE HOJE!"
                    ) : (
                      <>
                        {daysRemaining} <span className="text-[10px] font-bold self-end mb-0.5">DIAS</span>
                      </>
                    )}
                  </div>
                  {obraAtiva.data_termino && (
                    <div className={`text-[9px] font-medium mt-1 flex items-center gap-1 ${urgencyText} opacity-80`}>
                      <AlarmClock className="h-2.5 w-2.5" />
                      ENTREGA: {format(parseISO(obraAtiva.data_termino), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEMANAS */}
            <div className="flex flex-col gap-5 px-4 pt-4">
              {weeks.map((week) => {
                const weekTasks = getTasksForWeek(week.start, week.end);
                const completedCount = weekTasks.filter((t) => t.concluido).length;

                return (
                  <div key={week.id} className="flex flex-col gap-2">
                    {/* Header Semana - Compacto e Visual */}
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-base">{week.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {week.year}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{week.formattedRange}</span>
                      </div>
                      {weekTasks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`font-semibold ${completedCount === weekTasks.length ? "text-green-600" : "text-slate-600"}`}
                          >
                            {completedCount}/{weekTasks.length}
                          </span>
                          {completedCount === weekTasks.length && weekTasks.length > 0 && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Coluna Droppable - Cards */}
                    <div className="bg-white/50 rounded-xl border border-dashed border-slate-200 p-3 min-h-[80px]">
                      <KanbanColumn weekId={week.id}>
                        {weekTasks.map((atividade) => (
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

                      {/* Botão Adicionar - Touch Friendly */}
                      <Button
                        variant="ghost"
                        className="w-full mt-2 text-slate-400 hover:text-primary hover:bg-white h-12 text-sm font-medium rounded-xl border border-dashed border-slate-200"
                        onClick={() => handleOpenAdd(week.id)}
                      >
                        <Plus className="h-5 w-5 mr-2" /> Adicionar Atividade
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* SEÇÃO IMAGEM DA PLANTA/SETORES - MOBILE */}
              <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-4 mx-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-slate-700 text-sm">Planta de Setores</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPlanta}
                    >
                      {isUploadingPlanta ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                    </Button>
                    {obraAtiva.pmp_planta_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-red-600"
                        onClick={handleRemovePlanta}
                        disabled={isUploadingPlanta}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {obraAtiva.pmp_planta_url ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-100">
                    <img
                      src={obraAtiva.pmp_planta_url}
                      alt="Planta de Setores"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                    <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 text-center">Importe a planta do projeto</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-9"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? <KanbanCard atividade={activeDragItem} weekId="overlay" isOverlay /> : null}
          </DragOverlay>
        </DndContext>

        {/* MODAL MOBILE */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-[95vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editingId ? "Editar Atividade" : "Nova Atividade"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">O que será feito?</label>
                <Input
                  placeholder="Descrição da atividade..."
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase">Início</label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase">Término</label>
                  <Input
                    type="date"
                    value={formData.data_termino}
                    onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Responsável</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9 h-12 text-base"
                    placeholder="Quem irá executar?"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Setor</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary hover:text-primary/80"
                    onClick={() => setIsSetorModalOpen(true)}
                  >
                    <Settings className="h-3 w-3 mr-1" /> Cadastrar
                  </Button>
                </div>
                <Select value={formData.setor} onValueChange={(value) => setFormData({ ...formData, setor: value })}>
                  <SelectTrigger className="h-12">
                    <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores.length > 0 ? (
                      setores.map((setor) => (
                        <SelectItem key={setor} value={setor}>
                          {setor}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-3 text-center text-sm text-muted-foreground">Nenhum setor cadastrado</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Categoria</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(POSTIT_COLORS).map(([key]) => {
                    const colorMap: Record<string, string> = {
                      yellow: "bg-yellow-400",
                      green: "bg-emerald-500",
                      blue: "bg-blue-500",
                      red: "bg-red-500",
                      purple: "bg-purple-500",
                      orange: "bg-orange-500",
                      pink: "bg-pink-500",
                      cyan: "bg-cyan-500",
                      lime: "bg-lime-500",
                      indigo: "bg-indigo-500",
                      amber: "bg-amber-500",
                      teal: "bg-teal-500",
                    };
                    const bgClass = colorMap[key] || "bg-slate-200";
                    return (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-2 ring-slate-200" : "border-transparent"} ${bgClass}`}
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
                className="w-full h-12 bg-primary text-white hover:bg-primary/90 text-base font-semibold rounded-xl"
              >
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DESKTOP: Layout Original (Agora com Resizable Panels)
  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans bg-slate-50/30">
      {/* HEADER: TÍTULO E BOMBA RELÓGIO */}
      <div className="flex flex-col md:flex-row justify-between items-end px-2 py-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            PMP - Planejamento Mestre
          </h1>
          <p className="text-sm text-slate-500">
            {obraAtiva.nome_obra} • {weeks.length} semanas • {atividades.length} atividades
          </p>
        </div>

        {/* ÁREA DA BOMBA RELÓGIO (ALARME VISUAL) */}
        {daysRemaining !== null && (
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 ${urgencyBg} ${urgencyBorder} shadow-sm relative overflow-hidden transition-all duration-300 w-full md:w-auto min-w-[280px]`}
          >
            {/* Ícone da Bomba Pulsante */}
            <div className={`relative p-2 rounded-full bg-white/20 border-2 border-current ${iconColor}`}>
              <Bomb className={`h-6 w-6 ${isExploded ? "animate-bounce" : "animate-pulse"}`} />
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center w-full">
                <span className={`text-[10px] font-black uppercase tracking-widest ${urgencyText}`}>{statusLabel}</span>
                {isExploded && <AlertCircle className="h-3 w-3 text-white animate-ping" />}
              </div>

              <div
                className={`text-2xl font-black font-mono leading-none flex items-center gap-1 mt-0.5 ${urgencyText}`}
              >
                {daysRemaining < 0 ? (
                  <span className="flex items-center gap-2">ATRASO DE {Math.abs(daysRemaining)} DIAS</span>
                ) : daysRemaining === 0 ? (
                  "VENCE HOJE!"
                ) : (
                  <>
                    {daysRemaining} <span className="text-xs font-bold self-end mb-1">DIAS RESTANTES</span>
                  </>
                )}
              </div>

              {obraAtiva.data_termino && (
                <div
                  className={`text-[10px] font-bold mt-1 border-t border-current/20 pt-1 flex items-center gap-1 ${urgencyText} opacity-90`}
                >
                  <AlarmClock className="h-3 w-3" />
                  ENTREGA: {format(parseISO(obraAtiva.data_termino), "dd/MM/yyyy")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ResizablePanelGroup
        direction="vertical"
        className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        {/* PANEL 1: KANBAN BOARD (Maior destaque) */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full flex flex-col">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <ScrollArea className="w-full h-full">
                <div className="flex p-6 gap-4 h-full">
                  {weeks.map((week) => (
                    <div key={week.id} className="flex-shrink-0 w-[280px] flex flex-col gap-3 group/column">
                      {/* Header Semana */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                            {week.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100">
                            {week.year}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <span className="capitalize">{week.formattedRange}</span>
                        </div>
                      </div>

                      {/* Coluna Droppable */}
                      <div className="bg-slate-50/50 rounded-lg border border-dashed border-slate-200 p-2 min-h-[150px] flex-1 transition-colors hover:border-slate-300">
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
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* PANEL 2: PLANTA DE SETORES (Redimensionável) */}
        <ResizablePanel defaultSize={30} minSize={10} maxSize={80}>
          <div className="h-full flex flex-col p-4 bg-slate-50/30">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-slate-700">Planta de Setores</h3>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePlantaUpload(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPlanta}
                >
                  {isUploadingPlanta ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  {obraAtiva.pmp_planta_url ? "Substituir" : "Importar Imagem"}
                </Button>
                {obraAtiva.pmp_planta_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleRemovePlanta}
                    disabled={isUploadingPlanta}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white relative">
              {obraAtiva.pmp_planta_url ? (
                <img
                  src={obraAtiva.pmp_planta_url}
                  alt="Planta de Setores do Projeto"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500 text-center">
                    Importe uma imagem da planta do projeto com os setores identificados
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG ou WebP • Máx. 5MB</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* MODAL CADASTRAR SETOR */}
      <Dialog open={isSetorModalOpen} onOpenChange={setIsSetorModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Cadastrar Setor
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome do Setor</label>
              <Input
                placeholder="Ex: Térreo, 1º Pavimento, Área Externa..."
                value={newSetor}
                onChange={(e) => setNewSetor(e.target.value)}
                autoFocus
              />
            </div>
            {setores.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Setores Cadastrados</label>
                <div className="flex flex-wrap gap-2">
                  {setores.map((setor) => (
                    <Badge key={setor} variant="secondary" className="text-xs">
                      {setor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetorModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (newSetor.trim()) {
                  addSetorMutation.mutate(newSetor);
                }
              }}
              disabled={addSetorMutation.isPending || !newSetor.trim()}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {addSetorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Término</label>
                <Input
                  type="date"
                  value={formData.data_termino}
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Setor</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary hover:text-primary/80"
                  onClick={() => setIsSetorModalOpen(true)}
                >
                  <Settings className="h-3 w-3 mr-1" /> Cadastrar
                </Button>
              </div>
              <Select value={formData.setor} onValueChange={(value) => setFormData({ ...formData, setor: value })}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.length > 0 ? (
                    setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-center text-sm text-muted-foreground">Nenhum setor cadastrado</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Categoria</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(POSTIT_COLORS).map(([key]) => {
                  const colorMap: Record<string, string> = {
                    yellow: "bg-yellow-400",
                    green: "bg-emerald-500",
                    blue: "bg-blue-500",
                    red: "bg-red-500",
                    purple: "bg-purple-500",
                    orange: "bg-orange-500",
                    pink: "bg-pink-500",
                    cyan: "bg-cyan-500",
                    lime: "bg-lime-500",
                    indigo: "bg-indigo-500",
                    amber: "bg-amber-500",
                    teal: "bg-teal-500",
                  };
                  const bgClass = colorMap[key] || "bg-slate-200";
                  return (
                    <button
                      key={key}
                      onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-200" : "border-transparent hover:scale-105"} ${bgClass}`}
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
