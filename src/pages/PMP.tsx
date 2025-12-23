import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, CalendarRange, GripVertical, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInWeeks, parseISO, startOfWeek } from "date-fns";
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

// --- CONFIGURAÇÃO DE CORES (IDENTIDADE PADRÃO) ---
// Usamos bordas laterais para indicar cor, mantendo o card limpo (estilo Pipefy/Trello moderno)
const POSTIT_COLORS = {
  yellow: { border: "border-l-yellow-400", bg: "bg-white", text: "text-slate-700", ring: "ring-yellow-400" },
  green: { border: "border-l-emerald-500", bg: "bg-white", text: "text-slate-700", ring: "ring-emerald-500" },
  blue: { border: "border-l-blue-500", bg: "bg-white", text: "text-slate-700", ring: "ring-blue-500" },
  red: { border: "border-l-red-500", bg: "bg-white", text: "text-slate-700", ring: "ring-red-500" },
  purple: { border: "border-l-purple-500", bg: "bg-white", text: "text-slate-700", ring: "ring-purple-500" },
  orange: { border: "border-l-orange-500", bg: "bg-white", text: "text-slate-700", ring: "ring-orange-500" },
};

type ColorKey = keyof typeof POSTIT_COLORS;

interface PmpAtividade {
  id: string;
  obra_id: string;
  semana_referencia: string;
  titulo: string;
  cor: string;
}

// --- CARD (Draggable) ---
const KanbanCard = ({
  atividade,
  onDelete,
  isOverlay = false,
}: {
  atividade: PmpAtividade;
  onDelete?: (id: string) => void;
  isOverlay?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: atividade.id,
    data: { atividade, weekId: atividade.semana_referencia },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const theme = POSTIT_COLORS[atividade.cor as ColorKey] || POSTIT_COLORS.yellow;

  // Classes base do card
  const cardClasses = `
    relative group select-none p-3 rounded-md 
    border border-slate-200 border-l-[4px] ${theme.border}
    bg-white shadow-sm hover:shadow-md transition-all duration-200
    flex items-start gap-2
  `;

  if (isOverlay) {
    return (
      <div className={`${cardClasses} w-[280px] z-[9999] rotate-2 scale-105 shadow-xl`}>
        <GripVertical className="h-4 w-4 text-slate-400 mt-0.5" />
        <p className="text-sm font-medium text-slate-700 leading-snug">{atividade.titulo}</p>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[auto] min-h-[60px] w-full rounded-md border-2 border-dashed border-slate-300 bg-slate-50 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${cardClasses} cursor-grab active:cursor-grabbing`}
    >
      <div className="mt-0.5 text-slate-300 group-hover:text-slate-400 transition-colors">
        <GripVertical className="h-4 w-4" />
      </div>

      <p className="text-sm font-medium text-slate-700 flex-1 break-words leading-snug">{atividade.titulo}</p>

      {onDelete && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(atividade.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all"
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
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorKey>("yellow");
  const [activeDragItem, setActiveDragItem] = useState<PmpAtividade | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // 1. Gera as colunas de semanas (Lógica corrigida para data_termino)
  const weeks = useMemo(() => {
    // Casting 'any' para garantir acesso a propriedade data_termino
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
        formattedRange: `${format(currentWeekStart, "dd MMM", { locale: ptBR })} - ${format(currentWeekEnd, "dd MMM", { locale: ptBR })}`,
      });
    }
    return weeksArray;
  }, [obraAtiva]);

  // 2. Busca atividades
  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["pmp_atividades", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      const { data, error } = await supabase
        .from("pmp_atividades" as any)
        .select("*")
        .eq("obra_id", obraAtiva.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  // 3. Mutations (CRUD)
  const moveMutation = useMutation({
    mutationFn: async ({ id, novaSemana }: { id: string; novaSemana: string }) => {
      const { error } = await supabase
        .from("pmp_atividades" as any)
        .update({ semana_referencia: novaSemana })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, novaSemana }) => {
      await queryClient.cancelQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
      const previousData = queryClient.getQueryData(["pmp_atividades", obraAtiva?.id]);
      queryClient.setQueryData(["pmp_atividades", obraAtiva?.id], (old: PmpAtividade[] | undefined) => {
        if (!old) return [];
        return old.map((task) => (task.id === id ? { ...task, semana_referencia: novaSemana } : task));
      });
      return { previousData };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["pmp_atividades", obraAtiva?.id], context?.previousData);
      toast({ title: "Erro ao mover", variant: "destructive" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!obraAtiva?.id || !selectedWeek || !newTaskTitle.trim()) return;
      const { error } = await supabase.from("pmp_atividades" as any).insert({
        obra_id: obraAtiva.id,
        semana_referencia: selectedWeek,
        titulo: newTaskTitle,
        cor: selectedColor,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      setNewTaskTitle("");
      setIsModalOpen(false);
      toast({ title: "Atividade criada com sucesso" });
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
      toast({ title: "Atividade removida" });
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

    const activeId = String(active.id);
    const draggedTask = active.data.current?.atividade as PmpAtividade;
    let targetWeekId = "";

    // Lógica inteligente para detectar destino (Coluna ou Card)
    if (over.data.current?.type === "Column") {
      targetWeekId = over.data.current.weekId;
    } else if (over.data.current?.type === "Card") {
      targetWeekId = over.data.current.weekId;
    }

    if (targetWeekId && draggedTask && targetWeekId !== draggedTask.semana_referencia) {
      moveMutation.mutate({ id: activeId, novaSemana: targetWeekId });
    }
  };

  const handleOpenAdd = (weekId: string) => {
    setSelectedWeek(weekId);
    setIsModalOpen(true);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  if (!obraAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 bg-slate-50/50">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
          <FileText className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-700">Nenhuma obra selecionada</h2>
        <p className="text-sm text-slate-500 mt-1">Selecione uma obra no menu lateral para visualizar o PMP.</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 font-sans bg-slate-50/30">
      {/* HEADER PADRÃO */}
      <div className="flex justify-between items-center px-2 py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-primary" />
            PMP - Planejamento Mestre
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {obraAtiva.nome_obra}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">{weeks.length} semanas planejadas</span>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ÁREA DO KANBAN */}
        <ScrollArea className="w-full flex-1 border border-slate-200 rounded-xl bg-white shadow-sm">
          <div className="flex p-6 gap-4">
            {weeks.map((week) => (
              <div key={week.id} className="flex-shrink-0 w-[280px] flex flex-col gap-3 group/column">
                {/* CABEÇALHO DA COLUNA */}
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

                {/* ÁREA DE CARDS (Droppable) */}
                <div className="bg-slate-50/50 rounded-lg border border-dashed border-slate-200 p-2 min-h-[150px] transition-colors hover:border-slate-300">
                  <KanbanColumn weekId={week.id}>
                    {atividades
                      .filter((a) => a.semana_referencia === week.id)
                      .map((atividade) => (
                        <KanbanCard
                          key={atividade.id}
                          atividade={atividade}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      ))}
                  </KanbanColumn>

                  {/* BOTÃO ADICIONAR */}
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
          {activeDragItem ? <KanbanCard atividade={activeDragItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* MODAL DE CRIAÇÃO (Estilo Padrão) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">Nova Atividade</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Título da Atividade</label>
              <Input
                placeholder="Descreva a atividade..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                autoFocus
                className="border-slate-300 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Etiqueta de Cor</span>
              <div className="flex flex-wrap gap-3">
                {Object.entries(POSTIT_COLORS).map(([key, value]) => {
                  // Mapeamento de cores para os botões de seleção
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
                      onClick={() => setSelectedColor(key as ColorKey)}
                      className={`
                                w-8 h-8 rounded-full border-2 transition-all
                                ${selectedColor === key ? "border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-200" : "border-transparent hover:scale-105"} 
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
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Atividade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMP;
