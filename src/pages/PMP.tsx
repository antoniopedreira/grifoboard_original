import { useState, useMemo, useRef, useEffect } from "react";
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

// Mapa explícito de cores para os botões do seletor (garante que o Tailwind gere as classes)
const COLOR_BG_MAP: Record<ColorKey, string> = {
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

      <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-100/50">
        {dateDisplay && (
          <div className="flex items-center gap-2 text-[10px]">
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${isDelayed ? "bg-red-50 text-red-600 font-medium" : "bg-slate-100 text-slate-600"}`}
            >
              <CalendarIcon className="h-3 w-3" />
              <span>{dateDisplay}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {atividade.setor ? (
            <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded max-w-[50%]">
              <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
              <span className="truncate" title={atividade.setor}>
                {atividade.setor}
              </span>
            </div>
          ) : (
            <div></div>
          )}

          {atividade.responsavel && (
            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded max-w-[50%] ml-auto">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate" title={atividade.responsavel}>
                {atividade.responsavel}
              </span>
            </div>
          )}
        </div>
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
        flex flex-col gap-2 min-h-[50px] transition-colors duration-200
        ${isOver ? "bg-slate-100/50 ring-2 ring-primary/20 rounded-lg" : "bg-transparent"}
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
  const obraAtivaContext = userSession?.obraAtiva;
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
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: obraData } = useQuery({
    queryKey: ["obra_atual", obraAtivaContext?.id],
    queryFn: async () => {
      if (!obraAtivaContext?.id) return null;
      const { data, error } = await supabase.from("obras").select("*").eq("id", obraAtivaContext.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!obraAtivaContext?.id,
    initialData: obraAtivaContext,
  });

  const obraAtiva = obraData || obraAtivaContext;

  useEffect(() => {
    setImageError(false);
  }, [obraAtiva?.pmp_planta_url]);

  const { data: setores = [], refetch: refetchSetores } = useQuery({
    queryKey: ["registros-pmp-setores", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      const registros = await registrosService.listarRegistros(obraAtiva.id);
      return registros.filter((r) => r.tipo === "sector").map((r) => r.valor);
    },
    enabled: !!obraAtiva?.id,
  });

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
    setImageError(false);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `pmp-planta-${obraAtiva.id}-${Date.now()}.${fileExt}`;
      const filePath = `${obraAtiva.id}/${fileName}`;

      if (obraAtiva.pmp_planta_url) {
        try {
          const urlObj = new URL(obraAtiva.pmp_planta_url);
          const pathParts = urlObj.pathname.split("/diario-obra/");
          if (pathParts.length > 1) {
            const oldPath = pathParts[1];
            await supabase.storage.from("diario-obra").remove([oldPath]);
          }
        } catch (e) {
          console.log("Erro ao limpar imagem antiga", e);
        }
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

      queryClient.invalidateQueries({ queryKey: ["obra_atual", obraAtiva.id] });
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao enviar imagem", variant: "destructive" });
    } finally {
      setIsUploadingPlanta(false);
    }
  };

  const handleRemovePlanta = async () => {
    if (!obraAtiva?.id || !obraAtiva.pmp_planta_url) return;

    setIsUploadingPlanta(true);
    try {
      try {
        const urlObj = new URL(obraAtiva.pmp_planta_url);
        const pathParts = urlObj.pathname.split("/diario-obra/");
        if (pathParts.length > 1) {
          const oldPath = pathParts[1];
          await supabase.storage.from("diario-obra").remove([oldPath]);
        }
      } catch (e) {
        console.log("Erro ao remover arquivo do bucket", e);
      }

      const { error } = await supabase.from("obras").update({ pmp_planta_url: null }).eq("id", obraAtiva.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["obra_atual", obraAtiva.id] });
      toast({ title: "Imagem removida!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao remover imagem", variant: "destructive" });
    } finally {
      setIsUploadingPlanta(false);
    }
  };

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
    let styles = {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      icon: "text-orange-600",
      label: "TEMPO RESTANTE",
      exploded: false,
    };
    if (days < 0) {
      styles = {
        bg: "bg-red-600",
        border: "border-red-700",
        text: "text-white",
        icon: "text-white animate-bounce",
        label: "PRAZO ESTOURADO!",
        exploded: true,
      };
    } else if (days <= 14) {
      styles = {
        bg: "bg-red-100",
        border: "border-red-400",
        text: "text-red-800",
        icon: "text-red-600 animate-pulse",
        label: "PRAZO CRÍTICO",
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
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 });
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
      const { data } = await supabase
        .from("pmp_atividades" as any)
        .select("*")
        .eq("obra_id", obraAtiva.id)
        .order("concluido", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as unknown as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  const getTasksForWeek = (weekStart: Date, weekEnd: Date) => {
    return atividades.filter((atividade) => {
      if (!atividade.data_inicio || !atividade.data_termino)
        return atividade.semana_referencia === format(weekStart, "yyyy-MM-dd");
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

  const moveMutation = useMutation({
    mutationFn: async ({ id, newDataInicio, newDataTermino, novaSemanaRef }: any) => {
      await supabase
        .from("pmp_atividades" as any)
        .update({ data_inicio: newDataInicio, data_termino: newDataTermino, semana_referencia: novaSemanaRef })
        .eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] }),
  });

  const toggleCheckMutation = useMutation({
    mutationFn: async ({ id, novoStatus }: { id: string; novoStatus: boolean }) => {
      await supabase
        .from("pmp_atividades" as any)
        .update({ concluido: novoStatus })
        .eq("id", id);
    },
    onSuccess: async (_data, variables) => {
      const userId = userSession?.user?.id;
      if (userId) {
        if (variables.novoStatus)
          await gamificationService.awardXP(userId, "PMP_ATIVIDADE_CONCLUIDA", 50, variables.id);
        else await gamificationService.removeXP(userId, "PMP_ATIVIDADE_CONCLUIDA", 50, variables.id);
      }
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingId)
        await supabase
          .from("pmp_atividades" as any)
          .update(data)
          .eq("id", editingId);
      else await supabase.from("pmp_atividades" as any).insert({ obra_id: obraAtiva.id, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      handleCloseModal();
      toast({ title: "Salvo com sucesso" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("pmp_atividades" as any)
        .delete()
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      toast({ title: "Removido!" });
    },
  });

  // --- HANDLER DE DRAG AND DROP (CORRIGIDO) ---
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
    // Se soltou sobre uma coluna, pega o ID da coluna
    if (over.data.current?.type === "Column") {
      targetWeekId = over.data.current.weekId;
    }

    // Removida a verificação targetWeekId !== originWeekId para permitir "drop" na mesma coluna
    // Isso garante que a UI não trave ou dê feedback negativo, mesmo que a data não mude.
    if (targetWeekId && draggedTask && originWeekId) {
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
      data_inicio: atividade.data_inicio?.split("T")[0] || "",
      data_termino: atividade.data_termino?.split("T")[0] || "",
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
      ...formData,
      semana_referencia: semanaRef,
      data_inicio: formData.data_inicio || null,
      data_termino: formData.data_termino || null,
      setor: formData.setor || null,
    });
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  if (!obraAtiva) return <div className="flex justify-center items-center h-screen">Selecione uma obra</div>;

  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-slate-50/30">
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto pb-32">
            <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-primary" /> PMP
              </h1>
            </div>

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
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5 px-4 pt-4">
              {weeks.map((week) => (
                <div key={week.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
                    <span className="font-bold">{week.label}</span>
                  </div>
                  <div className="bg-white/50 rounded-xl border border-dashed border-slate-200 p-3 min-h-[80px]">
                    <KanbanColumn weekId={week.id}>
                      {getTasksForWeek(week.start, week.end).map((atividade) => (
                        <KanbanCard
                          key={`${atividade.id}::${week.id}`}
                          weekId={week.id}
                          atividade={atividade}
                          onDelete={(id) => deleteMutation.mutate(id)}
                          onClick={handleOpenEdit}
                          onToggleCheck={(id, s) => toggleCheckMutation.mutate({ id, novoStatus: !s })}
                        />
                      ))}
                    </KanbanColumn>
                    <Button variant="ghost" className="w-full mt-2" onClick={() => handleOpenAdd(week.id)}>
                      <Plus className="h-5 w-5 mr-2" /> Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-slate-200 rounded-xl bg-white shadow-sm p-4 mx-4 mt-6 mb-6">
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
                    {isUploadingPlanta ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
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

              {obraAtiva.pmp_planta_url && !imageError ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-100">
                  <img
                    src={obraAtiva.pmp_planta_url}
                    alt="Planta de Setores"
                    className="w-full h-auto object-contain"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                  {imageError ? (
                    <>
                      <AlertCircle className="h-10 w-10 mb-2 text-red-400 opacity-50" />
                      <p className="text-sm text-red-500 font-medium">Erro ao carregar imagem</p>
                      <p className="text-xs text-center text-slate-500 mt-1">
                        Verifique se o bucket 'diario-obra' é Público
                      </p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-500 text-center">Importe a planta do projeto</p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Selecionar
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? <KanbanCard atividade={activeDragItem} weekId="overlay" isOverlay /> : null}
          </DragOverlay>
        </DndContext>

        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-[95vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Nova"} Atividade</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-3">
              <Input
                placeholder="Título"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
                <Input
                  type="date"
                  value={formData.data_termino}
                  onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })}
                />
              </div>
              <Input
                placeholder="Responsável"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              />
              <Select value={formData.setor} onValueChange={(value) => setFormData({ ...formData, setor: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* CORREÇÃO AQUI: Usando o mapa de cores */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(POSTIT_COLORS).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${COLOR_BG_MAP[key as ColorKey]} ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-2 ring-slate-200" : "border-transparent"}`}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveForm}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // DESKTOP
  return (
    <div className="min-h-screen flex flex-col space-y-4 font-sans bg-slate-50/30 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end px-2 py-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            PMP - Planejamento Mestre
          </h1>
          <p className="text-sm text-slate-500">
            {obraAtiva.nome_obra} • {weeks.length} semanas
          </p>
        </div>
        {daysRemaining !== null && (
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 ${urgencyBg} ${urgencyBorder} shadow-sm`}
          >
            <Bomb className={`h-6 w-6 ${iconColor}`} />
            <div>
              <span className={`text-[10px] font-black uppercase ${urgencyText}`}>{statusLabel}</span>
              <div className={`text-2xl font-black ${urgencyText}`}>{daysRemaining} DIAS</div>
            </div>
          </div>
        )}
      </div>

      <div className="h-[580px] w-full border border-slate-200 rounded-xl bg-white shadow-sm flex-shrink-0 overflow-hidden flex flex-col">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="w-full h-full bg-slate-50/30">
            <div className="flex p-4 gap-4 h-full items-start">
              {weeks.map((week) => (
                <div key={week.id} className="flex-shrink-0 w-[280px] flex flex-col gap-3 h-full max-h-full">
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex-shrink-0 z-10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800 text-sm uppercase">{week.label}</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{week.year}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium capitalize">{week.formattedRange}</div>
                  </div>

                  <div className="bg-slate-100/50 rounded-lg border border-dashed border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    <ScrollArea className="flex-1 w-full">
                      <div className="p-2 pb-14">
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
                      </div>
                    </ScrollArea>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent pt-4">
                      <Button
                        variant="ghost"
                        className="w-full bg-white hover:bg-white/80 shadow-sm border border-slate-200 text-slate-600 text-xs h-8"
                        onClick={() => handleOpenAdd(week.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-3" />
          </ScrollArea>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? <KanbanCard atividade={activeDragItem} weekId="overlay" isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="h-[450px] w-full border border-slate-200 rounded-xl bg-white shadow-sm p-4 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-700">Planta de Setores</h3>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handlePlantaUpload(e.target.files[0]);
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
              {obraAtiva.pmp_planta_url ? "Trocar" : "Enviar"}
            </Button>
            {obraAtiva.pmp_planta_url && (
              <Button variant="ghost" size="sm" className="text-red-600" onClick={handleRemovePlanta}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50 relative flex items-center justify-center">
          {obraAtiva.pmp_planta_url && !imageError ? (
            <img
              src={obraAtiva.pmp_planta_url}
              alt="Planta"
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              {imageError ? (
                <>
                  <AlertCircle className="h-12 w-12 mb-2 text-red-400 opacity-50" />
                  <p className="text-sm text-red-500 font-medium">Erro ao carregar imagem</p>
                  <p className="text-xs mt-1">Verifique se o bucket 'diario-obra' é Público no Supabase</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma planta cadastrada</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Nova"} Atividade</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Título"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              />
              <Input
                type="date"
                value={formData.data_termino}
                onChange={(e) => setFormData({ ...formData, data_termino: e.target.value })}
              />
            </div>
            <Input
              placeholder="Responsável"
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
            />

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

            {/* CORREÇÃO AQUI: Usando o mapa estático de classes para as cores */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(POSTIT_COLORS).map((key) => (
                <button
                  key={key}
                  onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${COLOR_BG_MAP[key as ColorKey]} ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-200" : "border-transparent"}`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveForm}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSetorModalOpen} onOpenChange={setIsSetorModalOpen}>
        <DialogContent>
          <DialogTitle>Novo Setor</DialogTitle>
          <Input value={newSetor} onChange={(e) => setNewSetor(e.target.value)} placeholder="Nome do setor" />
          <DialogFooter>
            <Button onClick={() => addSetorMutation.mutate(newSetor)}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMP;
