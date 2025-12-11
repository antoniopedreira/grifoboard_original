import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface WeeklyCausesChartProps {
  weekStartDate: Date;
  tasks: Task[];
  className?: string;
}

interface CauseData {
  causa: string;
  quantidade: number;
  participacao: number;
  responsaveis: string[];
  grupo: string;
  isCritica: boolean;
  tasks: Task[];
}

const WeeklyCausesChart: React.FC<WeeklyCausesChartProps> = ({ weekStartDate, tasks, className }) => {
  const [causesData, setCausesData] = useState<CauseData[]>([]);
  const [selectedCause, setSelectedCause] = useState<CauseData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Grupos de causas (Mantidos para brevidade, iguais ao original)
  const causeGroups = {
    projeto: ["Projeto", "Desenho/Detalhamento", "Especificação"],
    planejamento: ["Planejamento/Sequenciamento", "Programação"],
    suprimentos: ["Suprimentos/Compras", "Material", "Fornecedor"],
    logistica: ["Logística/Entrega", "Transporte", "Armazenamento"],
    equipamento: ["Equipamento", "Ferramenta", "Manutenção"],
    recursos: ["Mão de Obra", "Disponibilidade de Equipe"],
    qualidade: ["Qualidade", "Retrabalho", "Inspeção"],
    externa: ["Interferência Externa", "Cliente", "Órgão Público"],
    clima: ["Clima", "Chuva", "Tempo"],
    outros: ["Outros", "Diversos"],
  };

  const criticalCauses = [
    "Projeto",
    "Planejamento/Sequenciamento",
    "Suprimentos/Compras",
    "Logística/Entrega",
    "Equipamento",
  ];

  const getCauseGroup = (causa: string): string => {
    for (const [group, causes] of Object.entries(causeGroups)) {
      if (causes.some((c) => causa.includes(c))) return group;
    }
    return "outros";
  };

  useEffect(() => {
    // Proteção: Garante que tasks seja um array
    const safeTasks = tasks || [];

    const currentWeekCauses = safeTasks
      .filter((task) => task.causeIfNotDone)
      .reduce(
        (acc, task) => {
          const cause = task.causeIfNotDone!;
          if (!acc[cause]) {
            acc[cause] = { count: 0, responsaveis: new Set<string>(), tasks: [] };
          }
          acc[cause].count++;
          acc[cause].responsaveis.add(task.responsible);
          acc[cause].tasks.push(task);
          return acc;
        },
        {} as Record<string, { count: number; responsaveis: Set<string>; tasks: Task[] }>,
      );

    const totalCauses = Object.values(currentWeekCauses).reduce((sum, c) => sum + c.count, 0);
    const processedData: CauseData[] = Object.entries(currentWeekCauses)
      .map(([causa, data]) => {
        const grupo = getCauseGroup(causa);
        const isCritica = criticalCauses.some((c) => causa.includes(c)) && grupo !== "clima";
        return {
          causa,
          quantidade: data.count,
          participacao: totalCauses > 0 ? (data.count / totalCauses) * 100 : 0,
          responsaveis: Array.from(data.responsaveis),
          grupo,
          isCritica,
          tasks: data.tasks,
        };
      })
      .sort((a, b) => b.quantidade - a.quantidade);

    setCausesData(processedData);
  }, [weekStartDate, tasks]);

  const handleCauseClick = (cause: CauseData) => {
    setSelectedCause(cause);
    setIsDialogOpen(true);
  };

  return (
    <div className={cn("h-full p-6 rounded-2xl", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <Filter className="h-5 w-5 text-secondary" />
          Causas da Semana
        </h3>
        <Badge variant="outline">{causesData.length} causas</Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-2">
        {causesData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma causa encontrada</p>
          </div>
        ) : (
          causesData.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCauseClick(item)}
              className={`p-3 rounded-lg border transition-colors hover:bg-muted/30 cursor-pointer ${item.isCritica ? "border-destructive/30 bg-destructive/5" : "border-border"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.causa}</span>
                    {item.isCritica && (
                      <Badge variant="destructive" className="text-xs">
                        Crítica
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.responsaveis.slice(0, 2).join(", ")}
                    {item.responsaveis.length > 2 && ` +${item.responsaveis.length - 2}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{item.quantidade}</div>
                  <div className="text-xs text-muted-foreground">{item.participacao.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Atividades com a causa: {selectedCause?.causa}</span>
              {selectedCause?.isCritica && (
                <Badge variant="destructive" className="text-xs">
                  Crítica
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCause && (
            <div className="space-y-3 mt-4">
              <div className="text-sm text-muted-foreground mb-4">Total de atividades: {selectedCause.quantidade}</div>

              {selectedCause.tasks.map((task, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="font-medium text-sm">{task.description}</div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Setor:</span> <span className="uppercase">{task.sector}</span>
                    </div>
                    <div>
                      <span className="font-medium">Disciplina:</span>{" "}
                      <span className="uppercase">{task.discipline}</span>
                    </div>
                    <div>
                      <span className="font-medium">Responsável:</span>{" "}
                      <span className="uppercase">{task.responsible}</span>
                    </div>
                    <div>
                      <span className="font-medium">Encarregado:</span>{" "}
                      <span className="uppercase">{task.executor}</span>
                    </div>
                    <div>
                      <span className="font-medium">Executante:</span> <span className="uppercase">{task.team}</span>
                    </div>
                  </div>

                  {task.item && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Item:</span> <span className="uppercase">{task.item}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(WeeklyCausesChart);
