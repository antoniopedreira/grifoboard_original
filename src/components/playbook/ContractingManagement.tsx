import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, User, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { playbookService } from "@/services/playbookService";
import { useToast } from "@/hooks/use-toast";

export interface ContractingItem {
  id: number | string;
  descricao: string;
  unidade: string;
  qtd: number;
  precoTotalMeta: number;
  nivel?: number; // Importante para lógica de Etapa Principal
  destino: string | null;
  responsavel: string | null;
  data_limite: string | null;
  valor_contratado: number | null;
  status_contratacao: string;
  observacao: string | null;
}

// Interface auxiliar para item com Etapa Principal calculada
interface EnrichedContractingItem extends ContractingItem {
  etapaPrincipal: string;
}

interface ContractingManagementProps {
  items: ContractingItem[];
  onUpdate: () => void;
}

export function ContractingManagement({ items, onUpdate }: ContractingManagementProps) {
  const { toast } = useToast();

  // 1. Processar itens para adicionar "Etapa Principal"
  // Como a lista vem ordenada, percorremos e guardamos o último Nível 0 visto
  let currentMainStage = "";
  const enrichedItems: EnrichedContractingItem[] = items.map((item) => {
    if (item.nivel === 0) {
      currentMainStage = item.descricao;
    }
    return {
      ...item,
      etapaPrincipal: currentMainStage || item.descricao, // Fallback para a própria descrição se não achar pai
    };
  });

  // 2. Filtrar apenas itens que têm destino definido
  const activeItems = enrichedItems.filter((i) => i.destino);

  const handleUpdate = async (id: number | string, field: string, value: any) => {
    try {
      await playbookService.updateItem(String(id), { [field]: value });
      onUpdate();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar item.", variant: "destructive" });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Função para capitalizar primeira letra de cada palavra
  const capitalize = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  };

  const ContractingRow = ({ item }: { item: EnrichedContractingItem }) => {
    const [responsavel, setResponsavel] = useState(item.responsavel || "");
    const [dataLimite, setDataLimite] = useState<Date | undefined>(
      item.data_limite ? new Date(item.data_limite) : undefined
    );
    const [valorContratado, setValorContratado] = useState(item.valor_contratado?.toString() || "");
    const [status, setStatus] = useState(item.status_contratacao || "A Negociar");
    const [observacao, setObservacao] = useState(item.observacao || "");
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isObsOpen, setIsObsOpen] = useState(false);

    const valorNum = parseFloat(valorContratado) || 0;
    const diferenca = valorNum - item.precoTotalMeta;
    const isSaving = diferenca <= 0;

    const saveResponsavel = () => {
      if (responsavel !== (item.responsavel || "")) {
        handleUpdate(item.id, "responsavel", responsavel);
      }
    };

    const saveDataLimite = (date: Date | undefined) => {
      setDataLimite(date);
      if (date) {
        handleUpdate(item.id, "data_limite", date.toISOString());
      }
      setIsCalendarOpen(false);
    };

    const saveValorContratado = () => {
      const val = parseFloat(valorContratado);
      if (!isNaN(val) && val !== item.valor_contratado) {
        handleUpdate(item.id, "valor_contratado", val);
      }
    };

    const saveStatus = (val: string) => {
      setStatus(val);
      handleUpdate(item.id, "status_contratacao", val);
    };

    const saveObservacao = () => {
      if (observacao !== (item.observacao || "")) {
        handleUpdate(item.id, "observacao", observacao);
      }
    };

    return (
      <TableRow className="hover:bg-slate-50 transition-colors">
        {/* Etapa Principal */}
        <TableCell
          className="font-bold text-[10px] text-slate-500 uppercase tracking-wide max-w-[150px] truncate"
          title={item.etapaPrincipal}
        >
          {item.etapaPrincipal.toLowerCase()}
        </TableCell>

        {/* Proposta */}
        <TableCell className="font-medium text-sm text-slate-700 max-w-[200px] truncate" title={item.descricao}>
          {capitalize(item.descricao)}
        </TableCell>

        {/* Responsável */}
        <TableCell>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <Input
              className="h-8 text-xs bg-white border-slate-200 hover:border-slate-300 focus:border-primary transition-all w-[100px]"
              placeholder="Nome..."
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              onBlur={saveResponsavel}
            />
          </div>
        </TableCell>

        {/* Data Limite */}
        <TableCell>
          <div onClick={(e) => e.stopPropagation()}>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-8 text-xs justify-start text-left font-normal w-[100px] px-2",
                    !dataLimite && "text-slate-400",
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dataLimite ? format(dataLimite, "dd/MM/yy") : "Definir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100] bg-white shadow-lg border" align="start">
                <Calendar
                  mode="single"
                  selected={dataLimite}
                  onSelect={saveDataLimite}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableCell>

        {/* Meta Total */}
        <TableCell className="text-right text-xs font-mono text-blue-700 bg-blue-50/30 font-medium">
          {formatCurrency(item.precoTotalMeta)}
        </TableCell>

        {/* Valor Contratado */}
        <TableCell>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">R$</span>
            <Input
              type="number"
              className="h-8 text-xs pl-6 text-right font-mono bg-white border-slate-200 focus:border-primary w-[90px]"
              placeholder="0,00"
              value={valorContratado}
              onChange={(e) => setValorContratado(e.target.value)}
              onBlur={saveValorContratado}
            />
          </div>
        </TableCell>

        {/* Diferença */}
        <TableCell className="text-right">
          {valorNum > 0 ? (
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-[10px]",
                isSaving ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200",
              )}
            >
              {formatCurrency(diferenca)}
            </Badge>
          ) : (
            <span className="text-slate-300">-</span>
          )}
        </TableCell>

        {/* Status */}
        <TableCell>
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={status} onValueChange={saveStatus}>
              <SelectTrigger
                className={cn(
                  "h-7 text-[10px] w-[110px] border-0",
                  status === "Negociada"
                    ? "bg-green-100 text-green-800 font-bold"
                    : status === "Em Andamento"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-slate-100 text-slate-500",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white shadow-lg border">
                <SelectItem value="A Negociar">A Negociar</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Negociada">Negociada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TableCell>

        {/* Obs */}
        <TableCell>
          <div onClick={(e) => e.stopPropagation()}>
            <Popover open={isObsOpen} onOpenChange={setIsObsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                  <FileText className={cn("h-4 w-4", observacao && "text-blue-500 fill-blue-100")} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 z-[100] bg-white shadow-lg border">
                <h4 className="font-medium text-sm mb-2 text-slate-700">Observações</h4>
                <textarea
                  className="w-full min-h-[100px] text-sm p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-slate-600 bg-white"
                  placeholder="Detalhes..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  onBlur={saveObservacao}
                />
              </PopoverContent>
            </Popover>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderTable = (filterDestino: string) => {
    const filtered = activeItems.filter((i) => i.destino === filterDestino);

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 mt-4">
          <p className="text-sm">Nenhum item enviado para {filterDestino} ainda.</p>
          <p className="text-xs mt-1">Vá na aba "Orçamento" e classifique os itens relevantes.</p>
        </div>
      );
    }

    return (
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden mt-4 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="w-[150px] font-bold text-slate-900">Etapa Principal</TableHead>
              <TableHead className="w-[200px]">Proposta</TableHead>
              <TableHead className="w-[120px]">Responsável</TableHead>
              <TableHead className="w-[120px]">Data Limite</TableHead>
              <TableHead className="text-right text-xs">Meta Total</TableHead>
              <TableHead className="w-[110px] text-right">Contratado</TableHead>
              <TableHead className="text-right w-[100px]">Diferença</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="w-[50px] text-center">Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <ContractingRow key={item.id} item={item} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Farol de Contratações</h2>
          <p className="text-sm text-slate-500">Gestão detalhada de itens críticos da obra.</p>
        </div>
      </div>

      <Tabs defaultValue="Obra" className="w-full">
        <TabsList className="bg-slate-100 p-1 border border-slate-200 w-full justify-start h-auto">
          <TabsTrigger
            value="Obra"
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-medium"
          >
            Obra Direta
            <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600 text-[10px] h-5 px-1.5">
              {activeItems.filter((i) => i.destino === "Obra").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="Fornecimento"
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700 font-medium"
          >
            Fornecimento
            <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600 text-[10px] h-5 px-1.5">
              {activeItems.filter((i) => i.destino === "Fornecimento").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="Cliente"
            className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 font-medium"
          >
            Cliente
            <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-600 text-[10px] h-5 px-1.5">
              {activeItems.filter((i) => i.destino === "Cliente").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Obra">{renderTable("Obra")}</TabsContent>
        <TabsContent value="Fornecimento">{renderTable("Fornecimento")}</TabsContent>
        <TabsContent value="Cliente">{renderTable("Cliente")}</TabsContent>
      </Tabs>
    </div>
  );
}
