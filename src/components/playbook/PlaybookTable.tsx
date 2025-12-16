import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search, ListTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Tipagem compatível com o Importer atualizado
export interface PlaybookItem {
  id: number; // ou string, dependendo do backend
  descricao: string;
  unidade: string;
  qtd: number;
  precoUnitario: number;
  precoTotal: number;
  // Mantemos isEtapa, mas a renderização principal usa 'nivel' (0, 1, 2)
  isEtapa: boolean;
  nivel?: number; // 0=Principal, 1=Subetapa, 2=Item
  precoUnitarioMeta: number;
  precoTotalMeta: number;
  porcentagem: number;
}

interface PlaybookTableProps {
  data: PlaybookItem[];
  grandTotalOriginal: number;
  grandTotalMeta: number;
}

export function PlaybookTable({ data, grandTotalOriginal, grandTotalMeta }: PlaybookTableProps) {
  // Alterado para um objeto map para suportar expandir múltiplos níveis independentemente
  const [expandedIds, setExpandedIds] = useState<Record<string | number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Toggle genérico (funciona para L0 e L1)
  const toggleRow = (id: number | string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    // Expande tudo que é pai (Nivel 0 ou 1)
    const allParents = data
      .filter((i) => i.nivel === 0 || i.nivel === 1 || i.isEtapa)
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr.id]: true,
        }),
        {},
      );
    setExpandedIds(allParents);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Filtragem básica para busca
  const filteredData = data.filter((item) => item.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- CÁLCULO DE TOTAIS POR AGRUPADOR ---
  // Mapa para guardar totais de L0 (Principal) e L1 (Subetapa)
  const totalsMap = new Map<number | string, { precoTotal: number; precoTotalMeta: number }>();

  // Variáveis auxiliares para o loop de soma
  let currentL0_Id: number | string | null = null;
  let currentL1_Id: number | string | null = null;

  // 1. Passada para calcular somas (Items somam para seus pais)
  data.forEach((item) => {
    const level = item.nivel ?? (item.isEtapa ? 0 : 2); // Fallback

    if (level === 0) {
      currentL0_Id = item.id;
      currentL1_Id = null;
      totalsMap.set(item.id, { precoTotal: 0, precoTotalMeta: 0 });
    } else if (level === 1) {
      currentL1_Id = item.id;
      totalsMap.set(item.id, { precoTotal: 0, precoTotalMeta: 0 });
    } else if (level === 2) {
      // Soma para o pai L1 se existir
      if (currentL1_Id !== null) {
        const t1 = totalsMap.get(currentL1_Id) || { precoTotal: 0, precoTotalMeta: 0 };
        totalsMap.set(currentL1_Id, {
          precoTotal: t1.precoTotal + item.precoTotal,
          precoTotalMeta: t1.precoTotalMeta + item.precoTotalMeta,
        });
      }
      // Soma para o pai L0 se existir
      if (currentL0_Id !== null) {
        const t0 = totalsMap.get(currentL0_Id) || { precoTotal: 0, precoTotalMeta: 0 };
        totalsMap.set(currentL0_Id, {
          precoTotal: t0.precoTotal + item.precoTotal,
          precoTotalMeta: t0.precoTotalMeta + item.precoTotalMeta,
        });
      }
    }
  });

  // --- LÓGICA DE RENDERIZAÇÃO HIERÁRQUICA ---
  // Resetamos variáveis para usar no loop de renderização (visibilidade)
  currentL0_Id = null;
  currentL1_Id = null;

  const rowsToRender = filteredData.map((item) => {
    const level = item.nivel ?? (item.isEtapa ? 0 : 2);
    const itemId = item.id;
    let isVisible = true;

    // Atualiza rastreamento de pais para visibilidade
    if (level === 0) {
      currentL0_Id = itemId;
      currentL1_Id = null;
    } else if (level === 1) {
      currentL1_Id = itemId;
    }

    // Se tiver busca, mostra tudo
    if (searchTerm) {
      const totals = level === 0 || level === 1 ? totalsMap.get(itemId) : undefined;
      return {
        ...item,
        level,
        visible: true,
        isExpanded: true,
        displayTotal: totals?.precoTotal || 0,
        displayTotalMeta: totals?.precoTotalMeta || 0,
      };
    }

    // Visibilidade Cascata (L0 -> L1 -> L2)
    if (level === 1) {
      if (currentL0_Id !== null && !expandedIds[currentL0_Id]) isVisible = false;
    } else if (level === 2) {
      if (currentL0_Id !== null && !expandedIds[currentL0_Id]) isVisible = false;
      else if (currentL1_Id !== null && !expandedIds[currentL1_Id]) isVisible = false;
    }

    const totals = level === 0 || level === 1 ? totalsMap.get(itemId) : undefined;

    return {
      ...item,
      level,
      visible: isVisible,
      isExpanded: !!expandedIds[itemId],
      // Se for pai, mostra o total calculado. Se for item, mostra o próprio valor.
      displayTotal: level === 0 || level === 1 ? totals?.precoTotal || 0 : item.precoTotal,
      displayTotalMeta: level === 0 || level === 1 ? totals?.precoTotalMeta || 0 : item.precoTotalMeta,
    };
  });

  return (
    <div className="space-y-4">
      {/* Toolbar da Tabela */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar item ou etapa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} className="text-slate-600">
            Expandir Todos
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} className="text-slate-600">
            Recolher Todos
          </Button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[30%] pl-6">Descrição</TableHead>
                <TableHead className="text-right w-[60px]">Unid.</TableHead>
                <TableHead className="text-right w-[60px]">Qtd</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Preço Total</TableHead>
                <TableHead className="text-right bg-blue-50/50 text-blue-900 border-l border-blue-100">
                  Unit. Meta
                </TableHead>
                <TableHead className="text-right bg-blue-50/50 text-blue-900 font-bold">Total Meta</TableHead>
                <TableHead className="text-right w-[50px]">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsToRender
                .filter((r) => r.visible)
                .map((item) => (
                  <TableRow
                    key={item.id}
                    className={cn(
                      // Estilo condicional para Níveis 0, 1 e 2
                      item.level === 0
                        ? "bg-slate-100/80 hover:bg-slate-200/50 cursor-pointer border-t-2 border-slate-200"
                        : item.level === 1
                          ? "bg-blue-50/30 hover:bg-blue-50 cursor-pointer border-t border-blue-100"
                          : "hover:bg-slate-50 border-b border-slate-50",
                    )}
                    onClick={item.level === 0 || item.level === 1 ? () => toggleRow(item.id) : undefined}
                  >
                    <TableCell
                      className={cn("py-3 relative", item.level === 0 ? "pl-4" : item.level === 1 ? "pl-8" : "pl-12")}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          item.level === 0
                            ? "font-black text-slate-800 uppercase text-sm"
                            : item.level === 1
                              ? "font-bold text-blue-900 text-xs uppercase tracking-wide"
                              : "text-slate-600 capitalize text-sm",
                        )}
                      >
                        {/* Ícone Expandir para Pais */}
                        {(item.level === 0 || item.level === 1) && (
                          <div className="p-1 rounded-md hover:bg-black/5 transition-colors">
                            {item.isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        )}

                        {/* Ícone Item para Filhos Nível 1 */}
                        {item.level === 1 && <ListTree className="h-3 w-3 text-blue-400 mr-1 opacity-50" />}

                        {/* Linha vertical visual para Itens */}
                        {item.level === 2 && <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200" />}

                        <span>{item.descricao.toLowerCase()}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-xs text-slate-500">{item.unidade}</TableCell>
                    <TableCell className="text-right text-xs text-slate-500">{item.qtd > 0 ? item.qtd : "-"}</TableCell>

                    <TableCell className="text-right text-xs font-mono text-slate-600">
                      {item.level === 2 && formatCurrency(item.precoUnitario)}
                    </TableCell>

                    <TableCell className="text-right text-xs font-mono text-slate-600 font-medium">
                      {/* Usa o displayTotal calculado (Soma para pais, Valor próprio para itens) */}
                      {formatCurrency(item.displayTotal)}
                    </TableCell>

                    {/* Meta Columns */}
                    <TableCell className="text-right text-xs font-mono text-blue-600 bg-blue-50/30 border-l border-blue-50">
                      {item.level === 2 && formatCurrency(item.precoUnitarioMeta)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-blue-700 bg-blue-50/30">
                      {formatCurrency(item.displayTotalMeta)}
                    </TableCell>

                    <TableCell className="text-right">
                      {item.level === 2 && item.porcentagem > 0 ? (
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                        >
                          {item.porcentagem.toFixed(2)}%
                        </Badge>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {rowsToRender.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    Nenhum item encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter className="bg-slate-800 text-white hover:bg-slate-800 border-t-4 border-yellow-500 sticky bottom-0 z-20 shadow-xl">
              <TableRow>
                <TableCell colSpan={4} className="pl-6 font-bold uppercase tracking-wider text-sm py-4">
                  Total Geral Consolidado
                </TableCell>
                <TableCell className="text-right font-bold font-mono text-white text-sm">
                  {formatCurrency(grandTotalOriginal)}
                </TableCell>
                <TableCell className="text-right border-l border-slate-600/50" />
                <TableCell className="text-right font-bold font-mono text-yellow-400 text-sm">
                  {formatCurrency(grandTotalMeta)}
                </TableCell>
                <TableCell className="text-right font-bold text-xs text-slate-300">100%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
}
