import { useState, useEffect } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Search, Filter, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeeklyCausesChartProps {
  weekStartDate: Date;
}

interface CauseData {
  causa: string;
  quantidade: number;
  deltaVsPrevious: number;
  participacao: number;
  responsaveis: string[];
  grupo: string;
  isCritica: boolean;
}

const WeeklyCausesChart: React.FC<WeeklyCausesChartProps> = ({ weekStartDate }) => {
  const { tasks } = useTaskManager(weekStartDate);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("todos");
  const [sortBy, setSortBy] = useState("quantidade");
  const [causesData, setCausesData] = useState<CauseData[]>([]);

  // Grupos de causas
  const causeGroups = {
    "projeto": ["Projeto", "Desenho/Detalhamento", "Especificação"],
    "planejamento": ["Planejamento/Sequenciamento", "Programação"],
    "suprimentos": ["Suprimentos/Compras", "Material", "Fornecedor"],
    "logistica": ["Logística/Entrega", "Transporte", "Armazenamento"],
    "equipamento": ["Equipamento", "Ferramenta", "Manutenção"],
    "recursos": ["Mão de Obra", "Disponibilidade de Equipe"],
    "qualidade": ["Qualidade", "Retrabalho", "Inspeção"],
    "externa": ["Interferência Externa", "Cliente", "Órgão Público"],
    "clima": ["Clima", "Chuva", "Tempo"],
    "outros": ["Outros", "Diversos"]
  };

  const criticalCauses = ["Projeto", "Planejamento/Sequenciamento", "Suprimentos/Compras", "Logística/Entrega", "Equipamento"];

  const getCauseGroup = (causa: string): string => {
    for (const [group, causes] of Object.entries(causeGroups)) {
      if (causes.some(c => causa.includes(c))) {
        return group;
      }
    }
    return "outros";
  };

  useEffect(() => {
    // Get previous week data for comparison
    const prevWeekStart = new Date(weekStartDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    // Current week causes
    const currentWeekCauses = tasks
      .filter(task => task.causeIfNotDone)
      .reduce((acc, task) => {
        const cause = task.causeIfNotDone!;
        if (!acc[cause]) {
          acc[cause] = { count: 0, responsaveis: new Set<string>() };
        }
        acc[cause].count++;
        acc[cause].responsaveis.add(task.responsible);
        return acc;
      }, {} as Record<string, { count: number; responsaveis: Set<string> }>);

    // Calculate totals and process data
    const totalCauses = Object.values(currentWeekCauses).reduce((sum, c) => sum + c.count, 0);
    
    const processedData: CauseData[] = Object.entries(currentWeekCauses).map(([causa, data]) => {
      const grupo = getCauseGroup(causa);
      const isCritica = criticalCauses.some(c => causa.includes(c)) && grupo !== "clima";
      
      return {
        causa,
        quantidade: data.count,
        deltaVsPrevious: Math.floor(Math.random() * 10) - 5, // Mock delta for now
        participacao: (data.count / totalCauses) * 100,
        responsaveis: Array.from(data.responsaveis),
        grupo,
        isCritica
      };
    });

    setCausesData(processedData);
  }, [weekStartDate, tasks]);

  // Filter and sort data
  const filteredData = causesData
    .filter(item => {
      const matchesSearch = item.causa.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = filterGroup === "todos" || item.grupo === filterGroup;
      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "quantidade":
          return b.quantidade - a.quantidade;
        case "delta":
          return b.deltaVsPrevious - a.deltaVsPrevious;
        case "participacao":
          return b.participacao - a.participacao;
        default:
          return 0;
      }
    });

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-3 w-3 text-destructive" />;
    if (delta < 0) return <TrendingDown className="h-3 w-3 text-success" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Causas da Semana
        </h3>
        <Badge variant="outline">{filteredData.length} causas</Badge>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar causa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="projeto">Projeto</SelectItem>
            <SelectItem value="planejamento">Planejamento</SelectItem>
            <SelectItem value="suprimentos">Suprimentos</SelectItem>
            <SelectItem value="logistica">Logística</SelectItem>
            <SelectItem value="equipamento">Equipamento</SelectItem>
            <SelectItem value="clima">Clima</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quantidade">Quantidade</SelectItem>
            <SelectItem value="delta">Δ vs sem-1</SelectItem>
            <SelectItem value="participacao">Participação %</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Causes List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma causa encontrada</p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-colors hover:bg-muted/30 cursor-pointer ${
                item.isCritica ? 'border-destructive/30 bg-destructive/5' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.causa}</span>
                    {item.isCritica && (
                      <Badge variant="destructive" className="text-xs">Crítica</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.responsaveis.slice(0, 2).join(", ")}
                    {item.responsaveis.length > 2 && ` +${item.responsaveis.length - 2}`}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-semibold text-sm">{item.quantidade}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {getDeltaIcon(item.deltaVsPrevious)}
                    <span>{Math.abs(item.deltaVsPrevious)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.participacao.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WeeklyCausesChart;