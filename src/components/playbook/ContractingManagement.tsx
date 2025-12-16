import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { playbookService } from "@/services/playbookService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ContractingItem {
  id: number | string;
  descricao: string;
  unidade: string;
  qtd: number;
  precoTotalMeta: number;
  nivel?: number;
  destino: string | null;
  responsavel: string | null;
  data_limite: string | null;
  valor_contratado: number | null;
  status_contratacao: string;
  observacao: string | null;
}

interface EnrichedContractingItem extends ContractingItem {
  etapaPrincipal: string;
}

interface ContractingManagementProps {
  items: ContractingItem[];
  onUpdate: () => void;
}

type FieldType = "responsavel" | "data" | "valor" | "status" | "obs";

export function ContractingManagement({ items, onUpdate }: ContractingManagementProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<EnrichedContractingItem | null>(null);
  const [editingField, setEditingField] = useState<FieldType | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  let currentMainStage = "";
  const enrichedItems: EnrichedContractingItem[] = items.map((item) => {
    if (item.nivel === 0) {
      currentMainStage = item.descricao;
    }
    return { ...item, etapaPrincipal: currentMainStage || item.descricao };
  });

  const activeItems = enrichedItems.filter((i) => i.destino);

  const capitalize = (str: string) => {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const openFieldModal = (item: EnrichedContractingItem, field: FieldType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditingField(field);
    
    switch (field) {
      case "responsavel":
        setFieldValue(item.responsavel || "");
        break;
      case "data":
        setDateValue(item.data_limite ? new Date(item.data_limite) : undefined);
        break;
      case "valor":
        setFieldValue(item.valor_contratado?.toString() || "");
        break;
      case "status":
        setFieldValue(item.status_contratacao || "A Negociar");
        break;
      case "obs":
        setFieldValue(item.observacao || "");
        break;
    }
  };

  const closeModal = () => {
    setEditingItem(null);
    setEditingField(null);
    setFieldValue("");
    setDateValue(undefined);
  };

  const handleSave = async () => {
    if (!editingItem || !editingField) return;
    
    try {
      const updates: Record<string, unknown> = {};
      
      switch (editingField) {
        case "responsavel":
          updates.responsavel = fieldValue || null;
          break;
        case "data":
          updates.data_limite = dateValue?.toISOString() || null;
          break;
        case "valor":
          updates.valor_contratado = fieldValue ? parseFloat(fieldValue) : null;
          break;
        case "status":
          updates.status_contratacao = fieldValue;
          break;
        case "obs":
          updates.observacao = fieldValue || null;
          break;
      }
      
      await playbookService.updateItem(String(editingItem.id), updates);
      toast({ description: "Salvo!" });
      closeModal();
      onUpdate();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
    }
  };

  const getModalTitle = () => {
    switch (editingField) {
      case "responsavel": return "Responsável";
      case "data": return "Data Limite";
      case "valor": return "Valor Contratado";
      case "status": return "Status";
      case "obs": return "Observação";
      default: return "";
    }
  };

  const renderFieldInput = () => {
    switch (editingField) {
      case "responsavel":
        return (
          <Input
            autoFocus
            placeholder="Nome do responsável"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        );
      case "data":
        return (
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={setDateValue}
            locale={ptBR}
            className="rounded-md border"
          />
        );
      case "valor":
        return (
          <Input
            autoFocus
            type="number"
            placeholder="0.00"
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        );
      case "status":
        return (
          <div className="flex flex-col gap-2">
            {["A Negociar", "Em Andamento", "Negociada"].map((status) => (
              <Button
                key={status}
                variant={fieldValue === status ? "default" : "outline"}
                className="justify-start"
                onClick={() => setFieldValue(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        );
      case "obs":
        return (
          <textarea
            autoFocus
            className="w-full min-h-[100px] text-sm p-3 border rounded-md resize-none"
            placeholder="Observações..."
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
          />
        );
      default:
        return null;
    }
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
              <TableHead className="w-[140px] font-bold text-slate-900">Etapa</TableHead>
              <TableHead>Proposta</TableHead>
              <TableHead className="w-[110px]">Responsável</TableHead>
              <TableHead className="w-[90px]">Data</TableHead>
              <TableHead className="text-right w-[100px]">Meta</TableHead>
              <TableHead className="text-right w-[100px]">Contratado</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[40px]">Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const valorNum = item.valor_contratado || 0;
              const diferenca = valorNum - item.precoTotalMeta;
              return (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="font-bold text-[10px] text-slate-500 uppercase truncate">
                    {item.etapaPrincipal.toLowerCase()}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-slate-700">
                    {capitalize(item.descricao)}
                  </TableCell>
                  <TableCell 
                    className="text-xs text-slate-600 cursor-pointer hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => openFieldModal(item, "responsavel", e)}
                  >
                    {item.responsavel || <span className="text-blue-400 text-[10px]">+ adicionar</span>}
                  </TableCell>
                  <TableCell 
                    className="text-xs text-slate-600 cursor-pointer hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => openFieldModal(item, "data", e)}
                  >
                    {item.data_limite ? (
                      format(new Date(item.data_limite), "dd/MM/yy")
                    ) : (
                      <CalendarIcon className="h-3 w-3 text-blue-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-blue-700 font-medium">
                    {formatCurrency(item.precoTotalMeta)}
                  </TableCell>
                  <TableCell 
                    className="text-right text-xs font-mono cursor-pointer hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => openFieldModal(item, "valor", e)}
                  >
                    {valorNum > 0 ? (
                      <span className={diferenca <= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(valorNum)}
                      </span>
                    ) : (
                      <span className="text-blue-400 text-[10px]">+ valor</span>
                    )}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => openFieldModal(item, "status", e)}
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px]",
                        item.status_contratacao === "Negociada" && "bg-green-100 text-green-800",
                        item.status_contratacao === "Em Andamento" && "bg-yellow-100 text-yellow-800",
                        (!item.status_contratacao || item.status_contratacao === "A Negociar") && "bg-slate-100 text-slate-500"
                      )}
                    >
                      {item.status_contratacao || "A Negociar"}
                    </Badge>
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:bg-blue-50 rounded transition-colors"
                    onClick={(e) => openFieldModal(item, "obs", e)}
                  >
                    <MessageSquare 
                      className={cn(
                        "h-4 w-4",
                        item.observacao ? "text-amber-500" : "text-slate-300"
                      )}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mini-Modal por Campo */}
      <Dialog open={!!editingItem && !!editingField} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            {editingItem && (
              <p className="text-xs text-slate-500 truncate">{capitalize(editingItem.descricao)}</p>
            )}
          </DialogHeader>
          <div className="py-4">
            {renderFieldInput()}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeModal}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Farol de Contratações</h2>
          <p className="text-sm text-slate-500">Clique em cada campo para editar.</p>
        </div>
      </div>

      {/* Tabs */}
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
