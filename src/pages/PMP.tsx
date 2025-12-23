import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, CalendarRange, StickyNote, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInWeeks, parseISO, startOfWeek } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable, useDraggable } from "@dnd-kit/core";

// --- CONFIGURAÇÃO DE CORES ---
const POSTIT_COLORS = {
  yellow: { bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-900", hover: "hover:bg-yellow-200" },
  green: {
    bg: "bg-emerald-100",
    border: "border-emerald-200",
    text: "text-emerald-900",
    hover: "hover:bg-emerald-200",
  },
  blue: { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-900", hover: "hover:bg-blue-200" },
  red: { bg: "bg-red-100", border: "border-red-200", text: "text-red-900", hover: "hover:bg-red-200" },
  purple: { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-900", hover: "hover:bg-purple-200" },
  orange: { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-900", hover: "hover:bg-orange-200" },
  pink: { bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-900", hover: "hover:bg-pink-200" },
  gray: { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-900", hover: "hover:bg-slate-200" },
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
    data: {
      type: "Card",
      atividade,
      weekId: atividade.semana_referencia, // IMPORTANTE: Saber de onde ele veio
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const colorStyle = POSTIT_COLORS[atividade.cor as ColorKey] || POSTIT_COLORS.yellow;

  if (isOverlay) {
    return (
      <div
        className={`p-3 rounded-md border shadow-2xl rotate-3 cursor-grabbing w-[280px] ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text}`}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 opacity-50 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium pr-6 break-words leading-snug">{atividade.titulo}</p>
        </div>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 opacity-50 h-[80px] w-full`}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-md border shadow-sm transition-all relative group select-none cursor-grab active:cursor-grabbing ${colorStyle.bg} ${colorStyle.border} ${colorStyle.text} ${colorStyle.hover}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 opacity-20 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium pr-6 break-words leading-snug">{atividade.titulo}</p>
      </div>

      {onDelete && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(atividade.id);
          }}
          className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity text-current cursor-pointer"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// --- COLUNA (Droppable) ---
const KanbanColumn = ({ weekId, children }: { weekId: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: weekId,
    data: {
      type: "Column",
      weekId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 min-h-[150px] transition-colors rounded-lg p-2 ${
        isOver ? "bg-slate-100 ring-2 ring-inset ring-[#C7A347]/50" : ""
      }`}
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

  // Drag State
  const [activeDragItem, setActiveDragItem] = useState<PmpAtividade | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px de movimento para iniciar o drag (evita cliques acidentais)
      },
    }),
  );

  // 1. Gera as colunas de semanas
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
        dateRange: `${format(currentWeekStart, "dd/MM")} - ${format(currentWeekEnd, "dd/MM")}`,
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
        .eq("obra_id", obraAtiva.id);
      if (error) throw error;
      return (data || []) as unknown as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  // 3. Mutation: Criar
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
      toast({ title: "Post-it criado!" });
    },
    onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
  });

  // 4. Mutation: Deletar
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

  // 5. Mutation: Mover (Lógica do Drag and Drop)
  const moveMutation = useMutation({
    mutationFn: async ({ id, novaSemana }: { id: string; novaSemana: string }) => {
      const { error } = await supabase
        .from("pmp_atividades" as any)
        .update({ semana_referencia: novaSemana })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, novaSemana }) => {
      // Otimização visual instantânea (Optimistic Update)
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades", obraAtiva?.id] });
    },
  });

  // --- HANDLERS DND ---

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

    // Identificar ONDE soltou
    let targetWeekId = "";

    // Caso 1: Soltou em cima de uma Coluna (vazia ou na área de drop)
    if (over.data.current?.type === "Column") {
      targetWeekId = over.data.current.weekId;
    }
    // Caso 2: Soltou em cima de outro Card
    else if (over.data.current?.type === "Card") {
      targetWeekId = over.data.current.weekId;
    }

    // Se achou uma semana válida e é diferente da atual, move!
    if (targetWeekId && draggedTask && targetWeekId !== draggedTask.semana_referencia) {
      moveMutation.mutate({
        id: activeId,
        novaSemana: targetWeekId,
      });
    }
  };

  const handleOpenAdd = (weekId: string) => {
    setSelectedWeek(weekId);
    setIsModalOpen(true);
  };

  if (!obraAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500 animate-in fade-in">
        <StickyNote className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Nenhuma obra selecionada</h2>
        <p>Selecione uma obra na barra lateral para ver o PMP.</p>
      </div>
    );
  }

  // Animação de Drop (Opcional, para suavidade)
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-[#112131] flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-[#C7A347]" />
            PMP - Planejamento Mestre
          </h1>
          <p className="text-slate-500 text-sm">
            {obraAtiva.nome_obra} • {weeks.length} Semanas Planejadas
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners} // Melhor algoritmo para cards em listas
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="w-full flex-1 border rounded-xl bg-slate-50/50">
          <div className="flex p-4 gap-4">
            {weeks.map((week) => (
              <div key={week.id} className="flex-shrink-0 w-[300px] flex flex-col gap-3">
                {/* Header da Semana */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm sticky top-0 z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#112131] uppercase text-xs tracking-wider">{week.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{week.year}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-600">{week.dateRange}</div>
                </div>

                {/* Coluna Droppable */}
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

                {/* Botão Adicionar */}
                <Button
                  variant="ghost"
                  className="w-full border-2 border-dashed border-slate-200 text-slate-400 hover:text-[#C7A347] hover:border-[#C7A347] hover:bg-[#C7A347]/5 h-10"
                  onClick={() => handleOpenAdd(week.id)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-3" />
        </ScrollArea>

        {/* Overlay (O card que segue o mouse) */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragItem ? <KanbanCard atividade={activeDragItem} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Criação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Novo Post-it</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Descreva a atividade..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              className="border-slate-300 focus:border-[#C7A347] focus:ring-[#C7A347]"
            />

            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cor do Post-it</span>
              <div className="flex flex-wrap gap-3 justify-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                {Object.entries(POSTIT_COLORS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedColor(key as ColorKey)}
                    className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
                      selectedColor === key
                        ? "border-slate-800 scale-110 ring-2 ring-offset-1 ring-slate-300"
                        : "border-transparent"
                    } ${value.bg.replace("100", "300")}`}
                    title={key}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="bg-[#112131] hover:bg-[#1a2f42]"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Colar no Quadro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMP;
