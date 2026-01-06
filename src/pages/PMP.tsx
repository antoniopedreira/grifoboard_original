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
  // Novos imports para Sortable
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- CONFIGURAÇÃO DE CORES ---
const POSTIT_COLORS = {
  yellow: { border: "border-l-yellow-400", ring: "ring-yellow-400" },
  green: { border: "border-l-emerald-500", ring: "ring-emerald-500" },
  blue: { border: "border-l-blue-500", ring: "ring-blue-500" },
  red: { border: "border-l-red-500", ring: "ring-red-500" },
  purple: { border: "border-l-purple-500", ring: "ring-purple-500" },
  orange: { border: "border-l-orange-500", ring: "ring-orange-500" },
  pink: { border: "border-l-pink-500", ring: "ring-pink-500" },
  cyan: { border: "border-l-cyan-500", ring: "ring-cyan-500" },
  lime: { border: "border-l-lime-500", ring: "ring-lime-500" },
  indigo: { border: "border-l-indigo-500", ring: "ring-indigo-500" },
  amber: { border: "border-l-amber-500", ring: "ring-amber-500" },
  teal: { border: "border-l-teal-500", ring: "ring-teal-500" },
};

type ColorKey = keyof typeof POSTIT_COLORS;

// Mapa explícito para garantir que o Tailwind gere as classes de background
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
  ordem?: number; // Novo campo para ordenação
}

// --- CARD (Sortable) ---
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

  // Usando useSortable para permitir reordenação
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: uniqueDragId,
    data: { atividade, originWeekId: weekId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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
      <div className={`${cardClasses} w-[280px] z-[9999] rotate-2 scale-105 shadow-xl bg-white cursor-grabbing`}>
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-slate-400 mt-0.5" />
          <p className="text-sm font-medium text-slate-700 leading-snug">{atividade.titulo}</p>
        </div>
      </div>
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

// --- COLUNA (Sortable Context) ---
const KanbanColumn = ({
  weekId,
  tasks,
  children,
}: {
  weekId: string;
  tasks: PmpAtividade[];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: weekId,
    data: { type: "Column", weekId },
  });

  // IDs únicos para o SortableContext
  const itemIds = useMemo(() => tasks.map((t) => `${t.id}::${weekId}`), [tasks, weekId]);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col gap-2 min-h-[50px] transition-colors duration-200
        ${isOver ? "bg-slate-100/50 ring-2 ring-primary/20 rounded-lg" : "bg-transparent"}
      `}
    >
      <SortableContext id={weekId} items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
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

  // Query de Obra
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

  // Query de Setores
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
  });

  const handlePlantaUpload = async (file: File) => {
    if (!obraAtiva?.id) return;
    setIsUploadingPlanta(true);
    setImageError(false);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `pmp-planta-${obraAtiva.id}-${Date.now()}.${fileExt}`;
      const filePath = `${obraAtiva.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("diario-obra")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("diario-obra").getPublicUrl(filePath);

      await supabase.from("obras").update({ pmp_planta_url: urlData.publicUrl }).eq("id", obraAtiva.id);

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
    if (!obraAtiva?.id) return;
    setIsUploadingPlanta(true);
    try {
      await supabase.from("obras").update({ pmp_planta_url: null }).eq("id", obraAtiva.id);
      queryClient.invalidateQueries({ queryKey: ["obra_atual", obraAtiva.id] });
      toast({ title: "Imagem removida!" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploadingPlanta(false);
    }
  };

  // Hooks de Cálculo
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
    const days = differenceInCalendarDays(end, startOfDay(new Date()));
    // ... lógica simples de alerta
    return {
      daysRemaining: days,
      urgencyBg: "bg-slate-50",
      urgencyBorder: "border-slate-200",
      urgencyText: "text-slate-700",
      iconColor: "text-slate-500",
      statusLabel: "PRAZO",
      isExploded: false,
    };
  }, [obraAtiva]);

  const weeks = useMemo(() => {
    if (!obraAtiva?.data_inicio || !obraAtiva?.data_termino) return [];
    const start = parseISO(obraAtiva.data_inicio);
    const end = parseISO(obraAtiva.data_termino);
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 1 });
    const totalWeeks = Math.max(differenceInWeeks(end, firstWeekStart) + 2, 1);
    const weeksArray = [];
    for (let i = 0; i < totalWeeks; i++) {
      const currentWeekStart = addDays(firstWeekStart, i * 7);
      const weekId = format(currentWeekStart, "yyyy-MM-dd");
      weeksArray.push({
        id: weekId,
        label: `Semana ${i + 1}`,
        year: format(currentWeekStart, "yyyy"),
        start: currentWeekStart,
        end: addDays(currentWeekStart, 6),
        formattedRange: `${format(currentWeekStart, "dd/MM")} - ${format(addDays(currentWeekStart, 6), "dd/MM")}`,
      });
    }
    return weeksArray;
  }, [obraAtiva]);

  const { data: atividades = [] } = useQuery({
    queryKey: ["pmp_atividades", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      // Ordena por ordem (se existir) ou created_at
      const { data } = await supabase
        .from("pmp_atividades" as any)
        .select("*")
        .eq("obra_id", obraAtiva.id)
        .order("ordem", { ascending: true, nullsFirst: false }) // Tenta ordenar por ordem
        .order("created_at", { ascending: true });
      return (data || []) as unknown as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  const getTasksForWeek = (weekStart: Date, weekEnd: Date) => {
    return atividades.filter((atividade) => {
      if (!atividade.data_inicio) return atividade.semana_referencia === format(weekStart, "yyyy-MM-dd");
      const start = parseISO(atividade.data_inicio);
      if (!isValid(start)) return false;
      return areIntervalsOverlapping(
        { start, end: atividade.data_termino ? parseISO(atividade.data_termino) : start },
        { start: weekStart, end: weekEnd },
        { inclusive: true },
      );
    });
  };

  // Mutation para atualizar ordem e semana
  const moveMutation = useMutation({
    mutationFn: async ({ id, newDataInicio, newDataTermino, novaSemanaRef, novaOrdem }: any) => {
      const updateData: any = { semana_referencia: novaSemanaRef };
      if (newDataInicio) updateData.data_inicio = newDataInicio;
      if (newDataTermino) updateData.data_termino = newDataTermino;
      if (novaOrdem !== undefined) updateData.ordem = novaOrdem;

      await supabase
        .from("pmp_atividades" as any)
        .update(updateData)
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] }),
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

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.atividade) setActiveDragItem(event.active.data.current.atividade as PmpAtividade);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    const activeTask = active.data.current?.atividade as PmpAtividade;
    if (!activeTask) return;

    const originWeekId = active.data.current?.originWeekId as string;
    let targetWeekId = "";

    // Se soltou sobre uma coluna
    if (over.data.current?.type === "Column") {
      targetWeekId = over.data.current.weekId;
    }
    // Se soltou sobre outro card (pega a coluna do card alvo)
    else if (over.data.current?.originWeekId) {
      targetWeekId = over.data.current.originWeekId;
    }

    if (!targetWeekId) return;

    // Calcular nova ordem
    // Logica simples: Se mudou de posição visualmente, calculamos a nova ordem.
    // Como estamos usando Sortable, active.id e over.id nos dão as posições relativas.
    // Para simplificar: apenas atualizamos a semana. A reordenação fina requer mais lógica de backend (recalcular indices).
    // Mas vamos permitir o drop na mesma coluna.

    // Se mudou de semana, atualiza datas
    let newDataInicio = null;
    let newDataTermino = null;

    if (targetWeekId !== originWeekId) {
      const originDate = parseISO(originWeekId);
      const targetDate = parseISO(targetWeekId);
      const daysDiff = differenceInCalendarDays(targetDate, originDate);

      if (activeTask.data_inicio && activeTask.data_termino) {
        newDataInicio = addDays(parseISO(activeTask.data_inicio), daysDiff).toISOString();
        newDataTermino = addDays(parseISO(activeTask.data_termino), daysDiff).toISOString();
      } else {
        newDataInicio = targetDate.toISOString();
        newDataTermino = addDays(targetDate, 5).toISOString();
      }
    }

    // Calcula uma nova "ordem" baseada na posição do drop (simplificado)
    // Se houver suporte no backend, isso salvará a ordem.
    const newIndex = over.data.current?.sortable?.index || 0;
    const novaOrdem = newIndex * 1000; // Exemplo simples

    moveMutation.mutate({
      id: activeTask.id,
      newDataInicio,
      newDataTermino,
      novaSemanaRef: targetWeekId,
      novaOrdem, // Envia a nova ordem se a coluna existir no banco
    });
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

  // Renderização principal
  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans bg-slate-50/30">
      {/* HEADER */}
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
      </div>

      {/* KANBAN BOARD */}
      <div className="h-[580px] w-full border border-slate-200 rounded-xl bg-white shadow-sm flex-shrink-0 overflow-hidden flex flex-col">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <ScrollArea className="w-full h-full bg-slate-50/30">
            <div className="flex p-4 gap-4 h-full items-start">
              {weeks.map((week) => {
                const weekTasks = getTasksForWeek(week.start, week.end);
                return (
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
                          <KanbanColumn weekId={week.id} tasks={weekTasks}>
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
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-3" />
          </ScrollArea>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? <KanbanCard atividade={activeDragItem} weekId="overlay" isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* PLANTA DE SETORES */}
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
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma planta cadastrada</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
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

            {/* SELETOR DE CORES CORRIGIDO */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(POSTIT_COLORS).map((key) => (
                <button
                  key={key}
                  onClick={() => setFormData({ ...formData, cor: key as ColorKey })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${COLOR_BG_MAP[key as ColorKey]} ${formData.cor === key ? "border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-200" : "border-transparent"}`}
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
