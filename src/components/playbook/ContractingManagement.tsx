import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Pencil } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

export function ContractingManagement({ items, onUpdate }: ContractingManagementProps) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<EnrichedContractingItem | null>(null);
  const [formData, setFormData] = useState({
    responsavel: "",
    data_limite: undefined as Date | undefined,
    valor_contratado: "",
    status_contratacao: "A Negociar",
    observacao: "",
  });

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

  const openEditModal = (item: EnrichedContractingItem) => {
    setEditingItem(item);
    setFormData({
      responsavel: item.responsavel || "",
      data_limite: item.data_limite ? new Date(item.data_limite) : undefined,
      valor_contratado: item.valor_contratado?.toString() || "",
      status_contratacao: item.status_contratacao || "A Negociar",
      observacao: item.observacao || "",
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    try {
      await playbookService.updateItem(String(editingItem.id), {
        responsavel: formData.responsavel || null,
        data_limite: formData.data_limite?.toISOString() || null,
        valor_contratado: formData.valor_contratado ? parseFloat(formData.valor_contratado) : null,
        status_contratacao: formData.status_contratacao,
        observacao: formData.observacao || null,
      });
      toast({ description: "Salvo com sucesso!" });
      setEditingItem(null);
      onUpdate();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar.", variant: "destructive" });
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
              <TableHead className="w-[150px] font-bold text-slate-900">Etapa</TableHead>
              <TableHead>Proposta</TableHead>
              <TableHead className="w-[100px]">Responsável</TableHead>
              <TableHead className="w-[90px]">Data</TableHead>
              <TableHead className="text-right w-[100px]">Meta</TableHead>
              <TableHead className="text-right w-[100px]">Contratado</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const valorNum = item.valor_contratado || 0;
              const diferenca = valorNum - item.precoTotalMeta;
              return (
                <TableRow key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEditModal(item)}>
                  <TableCell className="font-bold text-[10px] text-slate-500 uppercase truncate">
                    {item.etapaPrincipal.toLowerCase()}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-slate-700">
                    {capitalize(item.descricao)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.responsavel || <span className="text-slate-300">-</span>}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.data_limite ? format(new Date(item.data_limite), "dd/MM/yy") : <span className="text-slate-300">-</span>}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-blue-700 font-medium">
                    {formatCurrency(item.precoTotalMeta)}
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono">
                    {valorNum > 0 ? (
                      <span className={diferenca <= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(valorNum)}
                      </span>
                    ) : <span className="text-slate-300">-</span>}
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3 w-3" />
                    </Button>
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
      {/* Modal de Edição */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <p className="text-sm font-medium text-slate-700">{capitalize(editingItem.descricao)}</p>
              
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  placeholder="Nome do responsável"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Limite</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.data_limite ? format(formData.data_limite, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.data_limite}
                      onSelect={(date) => setFormData({ ...formData, data_limite: date })}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Valor Contratado (R$)</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={formData.valor_contratado}
                  onChange={(e) => setFormData({ ...formData, valor_contratado: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status_contratacao}
                  onValueChange={(val) => setFormData({ ...formData, status_contratacao: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A Negociar">A Negociar</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Negociada">Negociada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observação</Label>
                <textarea
                  className="w-full min-h-[80px] text-sm p-2 border rounded-md"
                  placeholder="Observações..."
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Farol de Contratações</h2>
          <p className="text-sm text-slate-500">Clique em um item para editar.</p>
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
