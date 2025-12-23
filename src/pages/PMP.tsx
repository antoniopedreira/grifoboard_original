import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, CalendarRange, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInWeeks, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PmpAtividade {
  id: string;
  obra_id: string;
  semana_referencia: string;
  titulo: string;
  cor: "yellow" | "blue" | "green" | "red";
}

const PMP = () => {
  const { userSession } = useAuth();
  const obraAtiva = userSession?.obraAtiva;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");

  // 1. Gera as colunas de semanas baseadas na data da obra
  const weeks = useMemo(() => {
    if (!obraAtiva?.data_inicio || !obraAtiva?.data_fim) return [];

    const start = parseISO(obraAtiva.data_inicio);
    const end = parseISO(obraAtiva.data_fim);
    // Ajusta para o início da semana (Domingo/Segunda) para alinhar o calendário
    const firstWeekStart = startOfWeek(start, { weekStartsOn: 0 }); 
    
    const totalWeeks = differenceInWeeks(end, firstWeekStart) + 2; // +2 para garantir cobertura total

    const weeksArray = [];
    for (let i = 0; i < totalWeeks; i++) {
      const currentWeekStart = addDays(firstWeekStart, i * 7);
      const currentWeekEnd = addDays(currentWeekStart, 6);
      
      // Identificador único da semana: Ano-Semana (ex: 2024-W10) ou DataInicio
      const weekId = format(currentWeekStart, "yyyy-MM-dd");
      
      weeksArray.push({
        id: weekId,
        label: `Semana ${i + 1}`,
        dateRange: `${format(currentWeekStart, "dd/MM")} - ${format(currentWeekEnd, "dd/MM")}`,
        fullDate: currentWeekStart
      });
    }
    return weeksArray;
  }, [obraAtiva]);

  // 2. Busca atividades
  const { data: atividades, isLoading } = useQuery({
    queryKey: ["pmp_atividades", obraAtiva?.id],
    queryFn: async () => {
      if (!obraAtiva?.id) return [];
      const { data, error } = await supabase
        .from("pmp_atividades" as any)
        .select("*")
        .eq("obra_id", obraAtiva.id);
      if (error) throw error;
      return data as PmpAtividade[];
    },
    enabled: !!obraAtiva?.id,
  });

  // 3. Mutation para criar atividade
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!obraAtiva?.id || !selectedWeek || !newTaskTitle.trim()) return;
      
      const { error } = await supabase.from("pmp_atividades" as any).insert({
        obra_id: obraAtiva.id,
        semana_referencia: selectedWeek,
        titulo: newTaskTitle,
        cor: selectedColor
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      setNewTaskTitle("");
      setIsModalOpen(false);
      toast({ title: "Post-it criado com sucesso!" });
    },
    onError: () => toast({ title: "Erro ao criar", variant: "destructive" }),
  });

  // 4. Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pmp_atividades" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pmp_atividades"] });
      toast({ title: "Removido!" });
    },
  });

  const handleOpenAdd = (weekId: string) => {
    setSelectedWeek(weekId);
    setIsModalOpen(true);
  };

  const getPostItColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 border-blue-200 text-blue-900 hover:bg-blue-200";
      case "green": return "bg-green-100 border-green-200 text-green-900 hover:bg-green-200";
      case "red": return "bg-red-100 border-red-200 text-red-900 hover:bg-red-200";
      default: return "bg-yellow-100 border-yellow-200 text-yellow-900 hover:bg-yellow-200"; // yellow
    }
  };

  if (!obraAtiva) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-slate-500">
        <StickyNote className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Nenhuma obra selecionada</h2>
        <p>Selecione uma obra na barra lateral para ver o PMP.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-[#C7A347]" />
            PMP - Planejamento Mestre
          </h1>
          <p className="text-slate-500 text-sm">
            {obraAtiva.nome_obra} • {weeks.length} Semanas Planejadas
          </p>
        </div>
      </div>

      <ScrollArea className="w-full flex-1 border rounded-xl bg-slate-50/50">
        <div className="flex p-4 gap-4">
          {weeks.map((week) => (
            <div key={week.id} className="flex-shrink-0 w-[280px] flex flex-col gap-3">
              {/* Header da Coluna (Semana) */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-700 uppercase text-xs tracking-wider">
                    {week.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {week.id.split('-')[0]}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-600">
                  {week.dateRange}
                </div>
              </div>

              {/* Lista de Atividades (Post-its) */}
              <div className="flex flex-col gap-2 min-h-[100px]">
                {isLoading ? (
                  <div className="h-20 bg-slate-200/50 rounded animate-pulse" />
                ) : (
                  atividades
                    ?.filter((a) => a.semana_referencia === week.id)
                    .map((atividade) => (
                      <div
                        key={atividade.id}
                        className={`p-3 rounded-md border shadow-sm transition-all relative group cursor-default ${getPostItColor(atividade.cor)}`}
                        style={{ transform: "rotate(-1deg)" }}
                      >
                        <p className="text-sm font-medium pr-6 break-words leading-snug">
                          {atividade.titulo}
                        </p>
                        <button
                          onClick={() => deleteMutation.mutate(atividade.id)}
                          className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                )}
              </div>

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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

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
            />
            <div className="flex gap-2 justify-center">
              {['yellow', 'blue', 'green', 'red'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                  } ${
                    color === 'yellow' ? 'bg-yellow-200' : 
                    color === 'blue' ? 'bg-blue-200' :
                    color === 'green' ? 'bg-green-200' : 'bg-red-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="bg-[#112131]">
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
