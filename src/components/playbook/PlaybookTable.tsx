import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Tipagem compatível com o Importer
export interface PlaybookItem {
  id: number;
  descricao: string;
  unidade: string;
  qtd: number;
  precoUnitario: number;
  precoTotal: number;
  isEtapa: boolean;
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
  const [expandedEtapas, setExpandedEtapas] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Inicializa expandindo todas as etapas na primeira carga (opcional)
  // useEffect(() => {
  //   const etapaIds = data.filter(i => i.isEtapa).map(i => i.id);
  //   setExpandedEtapas(etapaIds);
  // }, []);

  const toggleEtapa = (id: number) => {
    setExpandedEtapas(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const allEtapaIds = data.filter(i => i.isEtapa).map(i => i.id);
    if (expandedEtapas.length === allEtapaIds.length) {
      setExpandedEtapas([]);
    } else {
      setExpandedEtapas(allEtapaIds);
    }
  };

  // Filtragem básica para busca
  const filteredData = data.filter(item => 
    item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Renderização Hierárquica
  // Precisamos iterar sobre os dados e decidir quem mostrar baseado no estado 'expanded'
  // Como os dados vêm planos do importer (lista sequencial), vamos renderizar na ordem
  // Mas esconder itens cujo "pai" (etapa anterior) não está expandido.
  
  let currentEtapaId: number | null = null;
  let isCurrentEtapaExpanded = true;

  const rowsToRender = filteredData.map((item) => {
    if (item.isEtapa) {
      currentEtapaId = item.id;
      isCurrentEtapaExpanded = expandedEtapas.includes(item.id);
      return { ...item, visible: true, isExpanded: isCurrentEtapaExpanded };
    } else {
      // Se estamos buscando, mostrar tudo para não esconder resultados
      return { ...item, visible: searchTerm ? true : isCurrentEtapaExpanded, isExpanded: false };
    }
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
        <Button variant="outline" size="sm" onClick={toggleAll} className="text-slate-600">
          {expandedEtapas.length > 0 ? "Recolher Todos" : "Expandir Todos"}
        </Button>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-[40%] pl-6">Descrição</TableHead>
                <TableHead className="text-right w-[80px]">Unid.</TableHead>
                <TableHead className="text-right w-[80px]">Qtd</TableHead>
                <TableHead className="text-right">Preço Total</TableHead>
                <TableHead className="text-right bg-blue-50/50 text-blue-900 border-l border-blue-100">Unit. Meta</TableHead>
                <TableHead className="text-right bg-blue-50/50 text-blue-900 font-bold">Total Meta</TableHead>
                <TableHead className="text-right w-[80px]">Rep. (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsToRender.filter(r => r.visible).map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    item.isEtapa 
                      ? "bg-slate-100/80 hover:bg-slate-200/50 cursor-pointer border-t border-slate-200" 
                      : "hover:bg-slate-50 border-b border-slate-50"
                  )}
                  onClick={item.isEtapa ? () => toggleEtapa(item.id) : undefined}
                >
                  <TableCell className={cn("py-3 pl-6 relative")}>
                    <div className={cn(
                      "flex items-center gap-2",
                      item.isEtapa ? "font-bold text-slate-800 uppercase text-sm" : "pl-8"
                    )}>
                      {item.isEtapa && (
                        <div className="p-1 rounded-md hover:bg-slate-300/50 transition-colors">
                          {item.isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                        </div>
                      )}
                      
                      {!item.isEtapa && (
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200" />
                      )}

                      <span className={cn(!item.isEtapa && "text-slate-600 capitalize text-sm")}>
                        {item.descricao.toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right text-xs text-slate-500">
                    {item.unidade}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">
                    {item.qtd > 0 ? item.qtd : "-"}
                  </TableCell>
                  
                  <TableCell className="text-right text-xs font-mono text-slate-600 font-medium">
                    {!item.isEtapa && formatCurrency(item.precoTotal)}
                  </TableCell>
                  
                  {/* Meta Columns */}
                  <TableCell className="text-right text-xs font-mono text-blue-600 bg-blue-50/30 border-l border-blue-50">
                    {!item.isEtapa && formatCurrency(item.precoUnitarioMeta)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono font-bold text-blue-700 bg-blue-50/30">
                    {!item.isEtapa && formatCurrency(item.precoTotalMeta)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {!item.isEtapa && item.porcentagem > 0 ? (
                      <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200">
                        {item.porcentagem.toFixed(2)}%
                      </Badge>
                    ) : ""}
                  </TableCell>
                </TableRow>
              ))}
              
              {rowsToRender.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Nenhum item encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter className="bg-slate-800 text-white hover:bg-slate-800 border-t-4 border-yellow-500 sticky bottom-0 z-20 shadow-xl">
              <TableRow>
                <TableCell colSpan={3} className="pl-6 font-bold uppercase tracking-wider text-sm py-4">
                  Total Geral Consolidado
                </TableCell>
                <TableCell className="text-right font-bold font-mono text-white text-sm">
                  {formatCurrency(grandTotalOriginal)}
                </TableCell>
                <TableCell className="text-right border-l border-slate-600/50" />
                <TableCell className="text-right font-bold font-mono text-yellow-400 text-sm">
                  {formatCurrency(grandTotalMeta)}
                </TableCell>
                <TableCell className="text-right font-bold text-xs text-slate-300">
                  100%
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
}
