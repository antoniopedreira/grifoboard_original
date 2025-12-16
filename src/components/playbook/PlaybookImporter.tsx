import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, ArrowRight, Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { playbookService } from "@/services/playbookService";

// Interface interna do componente
interface PlaybookItem {
  id: number;
  descricao: string;
  unidade: string;
  qtd: number;
  precoUnitario: number;
  precoTotal: number;
  isEtapa: boolean; 
  parentIndex?: number; 
}

// Prop para atualizar a tela principal
interface PlaybookImporterProps {
  onSave?: () => void;
}

export function PlaybookImporter({ onSave }: PlaybookImporterProps) {
  const { toast } = useToast();
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [rawData, setRawData] = useState<PlaybookItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Coeficientes
  const [coef1, setCoef1] = useState<string>("0.57");
  const [coef2, setCoef2] = useState<string>("0.75");
  const [selectedCoef, setSelectedCoef] = useState<"1" | "2">("1");

  // 1. Processar Arquivo (Upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Mapeamento das colunas (Assumindo ordem A, B, C, D, E)
      const formatted: PlaybookItem[] = data.slice(1).map((row, index) => ({
        id: index,
        descricao: row[0] ? String(row[0]).trim() : "",
        unidade: row[1] ? String(row[1]).trim() : "",
        qtd: row[2] ? Number(row[2]) : 0,
        precoUnitario: row[3] ? Number(row[3]) : 0,
        precoTotal: row[4] ? Number(row[4]) : 0,
        isEtapa: false 
      })).filter(item => item.descricao !== ""); 

      // Auto-detecção simples: Sem unidade/qtd mas com preço ou texto = Etapa
      const autoDetected = formatted.map(item => ({
        ...item,
        isEtapa: (!item.unidade || item.unidade.toLowerCase() === 'vb') && (!item.qtd || item.qtd === 0)
      }));

      setRawData(autoDetected);
    };
    reader.readAsBinaryString(file);
  };

  // 2. Alternar manualmente se é Etapa ou Item
  const toggleEtapa = (index: number) => {
    setRawData(prev => prev.map((item, i) => 
      i === index ? { ...item, isEtapa: !item.isEtapa } : item
    ));
  };

  // 3. Cálculos Dinâmicos (Metas, Totais e Porcentagens)
  const processedData = useMemo(() => {
    const activeCoef = selectedCoef === "1" ? parseFloat(coef1) : parseFloat(coef2);
    const validCoef = isNaN(activeCoef) ? 1 : activeCoef;

    let grandTotalMeta = 0;
    let grandTotalOriginal = 0;

    // Passo 1: Calcular valores individuais e acumular totais (apenas de itens para não duplicar)
    const hierarchyData = rawData.map((item) => {
      const precoUnitarioMeta = item.precoUnitario * validCoef;
      const precoTotalMeta = item.precoTotal * validCoef;

      if (!item.isEtapa) {
        grandTotalMeta += precoTotalMeta;
        grandTotalOriginal += item.precoTotal;
      }

      return {
        ...item,
        precoUnitarioMeta,
        precoTotalMeta
      };
    });

    // Passo 2: Calcular porcentagem relativa ao total da meta
    const finalData = hierarchyData.map(item => ({
      ...item,
      porcentagem: grandTotalMeta > 0 && !item.isEtapa 
        ? (item.precoTotalMeta / grandTotalMeta) * 100 
        : 0
    }));

    return { items: finalData, grandTotalMeta, grandTotalOriginal };

  }, [rawData, coef1, coef2, selectedCoef]);

  // 4. Salvar no Banco de Dados
  const handleSave = async () => {
    if (!obraId) {
      toast({ title: "Erro", description: "Nenhuma obra selecionada.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // Formatar itens para o Supabase
      const itemsToSave = processedData.items.map((item, index) => ({
        obra_id: obraId,
        descricao: item.descricao,
        unidade: item.unidade,
        qtd: item.qtd,
        preco_unitario: item.precoUnitario,
        preco_total: item.precoTotal,
        is_etapa: item.isEtapa,
        ordem: index
      }));

      const configToSave = {
        obra_id: obraId,
        coeficiente_1: parseFloat(coef1),
        coeficiente_2: parseFloat(coef2),
        coeficiente_selecionado: selectedCoef as '1' | '2'
      };

      await playbookService.savePlaybook(obraId, configToSave, itemsToSave);

      toast({
        title: "Playbook Salvo!",
        description: `Orçamento de ${formatCurrency(processedData.grandTotalOriginal)} importado com sucesso.`,
        className: "bg-green-50 border-green-200"
      });

      if (onSave) onSave();
      setIsOpen(false);

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: "Verifique sua conexão.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 shadow-sm transition-all">
          <FileSpreadsheet className="h-4 w-4" />
          Importar Orçamento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-slate-50/50">
        
        {/* HEADER */}
        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
            <div>
                <DialogTitle className="text-xl font-heading text-slate-800">
                    {step === 1 ? "1. Importar e Definir Etapas" : "2. Definir Metas e Visualizar"}
                </DialogTitle>
                <DialogDescription>
                    {step === 1 
                        ? "Carregue o arquivo e clique nas linhas que representam as ETAPAS principais." 
                        : "Ajuste os coeficientes para calcular a meta de cada item."}
                </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className={cn("h-2 w-8 rounded-full", step === 1 ? "bg-primary" : "bg-primary/30")} />
                <div className={cn("h-2 w-8 rounded-full", step === 2 ? "bg-primary" : "bg-slate-200")} />
            </div>
        </div>

        {/* --- PASSO 1: UPLOAD E SELEÇÃO DE ETAPAS --- */}
        {step === 1 && (
          <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
            {rawData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4 p-10">
                        <div className="bg-white p-4 rounded-full shadow-sm">
                            <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center space-y-1">
                            <span className="text-lg font-medium text-slate-700">Clique para selecionar o arquivo .xlsx ou .csv</span>
                            <p className="text-sm text-slate-400">Modelo: Descrição | Unidade | Qtd | Preço Unit. | Preço Total</p>
                        </div>
                    </Label>
                    <Input id="file-upload" type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
                </div>
            ) : (
                <div className="flex flex-col h-full gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-800 text-sm flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <span>Clique nas linhas abaixo para marcá-las como <strong>ETAPA (Título)</strong> ou <strong>ITEM (Subetapa)</strong>.</span>
                    </div>
                    
                    <div className="flex-1 border rounded-lg bg-white overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <Table>
                                <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[80px] text-center">Tipo</TableHead>
                                        <TableHead>Descrição Original</TableHead>
                                        <TableHead className="w-[100px] text-right">Unidade</TableHead>
                                        <TableHead className="w-[150px] text-right">Preço Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rawData.map((row, idx) => (
                                        <TableRow 
                                            key={idx} 
                                            className={cn(
                                                "cursor-pointer transition-all hover:bg-slate-50",
                                                row.isEtapa ? "bg-slate-100 font-bold border-l-4 border-l-primary" : "text-slate-600"
                                            )}
                                            onClick={() => toggleEtapa(idx)}
                                        >
                                            <TableCell className="text-center py-2">
                                                <Badge variant={row.isEtapa ? "default" : "outline"} className={cn("text-[10px] uppercase", !row.isEtapa && "text-slate-400 border-slate-200")}>
                                                    {row.isEtapa ? "Etapa" : "Item"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                {row.descricao}
                                            </TableCell>
                                            <TableCell className="text-right text-xs py-2">{row.unidade}</TableCell>
                                            <TableCell className="text-right font-mono text-xs py-2">
                                                {formatCurrency(row.precoTotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* --- PASSO 2: CONFIGURAÇÃO DE METAS E VISUALIZAÇÃO --- */}
        {step === 2 && (
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Barra de Controles */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-end shadow-sm z-10">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Coeficiente 1</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            value={coef1} 
                            onChange={(e) => setCoef1(e.target.value)} 
                            className="bg-white border-slate-300 h-9 font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Coeficiente 2</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            value={coef2} 
                            onChange={(e) => setCoef2(e.target.value)} 
                            className="bg-white border-slate-300 h-9 font-mono text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Coeficiente Ativo</Label>
                        <RadioGroup value={selectedCoef} onValueChange={(v: "1"|"2") => setSelectedCoef(v)} className="flex gap-2">
                            <div className={cn(
                                "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all",
                                selectedCoef === "1" ? "bg-primary text-white border-primary" : "bg-white hover:bg-slate-50 border-slate-300"
                            )}>
                                <RadioGroupItem value="1" id="c1" className="sr-only" />
                                <Label htmlFor="c1" className="cursor-pointer font-bold text-sm">Opção 1</Label>
                            </div>
                            <div className={cn(
                                "flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all",
                                selectedCoef === "2" ? "bg-primary text-white border-primary" : "bg-white hover:bg-slate-50 border-slate-300"
                            )}>
                                <RadioGroupItem value="2" id="c2" className="sr-only" />
                                <Label htmlFor="c2" className="cursor-pointer font-bold text-sm">Opção 2</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Tabela de Pré-visualização */}
                <div className="flex-1 overflow-auto bg-slate-50/30 p-6">
                    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
                        <ScrollArea className="flex-1">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-20">
                                    <TableRow>
                                        <TableHead className="w-[40%] pl-6">Descrição</TableHead>
                                        <TableHead className="text-right">Unid.</TableHead>
                                        <TableHead className="text-right">Qtd</TableHead>
                                        <TableHead className="text-right">Preço Total</TableHead>
                                        <TableHead className="text-right bg-blue-50/50 text-blue-900 border-l border-blue-100">Unit. Meta</TableHead>
                                        <TableHead className="text-right bg-blue-50/50 text-blue-900 font-bold">Total Meta</TableHead>
                                        <TableHead className="text-right w-[80px]">Rep. (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedData.items.map((item, idx) => (
                                        <TableRow 
                                            key={idx} 
                                            className={cn(
                                                item.isEtapa ? "bg-slate-100 hover:bg-slate-200/80 border-y border-slate-200" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <TableCell className={cn("py-3 pl-6")}>
                                                <div className={cn(
                                                    item.isEtapa 
                                                        ? "font-extrabold text-slate-800 uppercase tracking-tight" 
                                                        : "pl-6 capitalize text-slate-600 border-l-2 border-slate-100"
                                                )}>
                                                    {item.descricao.toLowerCase()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">{item.unidade}</TableCell>
                                            <TableCell className="text-right text-xs text-slate-500">{item.qtd > 0 ? item.qtd : "-"}</TableCell>
                                            <TableCell className="text-right text-xs font-mono text-slate-700">
                                                {formatCurrency(item.precoTotal)}
                                            </TableCell>
                                            
                                            {/* Colunas de Meta */}
                                            <TableCell className="text-right text-xs font-mono text-blue-700 bg-blue-50/30 border-l border-blue-50">
                                                {formatCurrency(item.precoUnitarioMeta)}
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-mono font-bold text-blue-800 bg-blue-50/30">
                                                {formatCurrency(item.precoTotalMeta)}
                                            </TableCell>
                                            
                                            {/* Coluna Porcentagem */}
                                            <TableCell className="text-right text-xs font-medium text-slate-600">
                                                {!item.isEtapa && item.porcentagem > 0 ? (
                                                    <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-100">
                                                        {item.porcentagem.toFixed(2)}%
                                                    </Badge>
                                                ) : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                
                                {/* RODAPÉ COM TOTAIS GERAIS */}
                                <TableFooter className="bg-slate-800 text-white border-t-2 border-slate-300 sticky bottom-0 z-20 shadow-[0_-5px_10px_rgba(0,0,0,0.1)]">
                                    <TableRow>
                                        <TableCell colSpan={3} className="pl-6 font-bold uppercase tracking-wider text-sm py-4">
                                            Total Geral Consolidado (Soma dos Itens)
                                        </TableCell>
                                        <TableCell className="text-right font-bold font-mono text-white text-sm">
                                            {formatCurrency(processedData.grandTotalOriginal)}
                                        </TableCell>
                                        <TableCell className="text-right border-l border-slate-600/50" />
                                        <TableCell className="text-right font-bold font-mono text-yellow-400 text-sm">
                                            {formatCurrency(processedData.grandTotalMeta)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-xs text-slate-300">
                                            100%
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        )}

        {/* FOOTER DO DIÁLOGO */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
            {step === 2 ? (
                <Button variant="outline" onClick={() => setStep(1)} className="text-slate-600">
                    Voltar
                </Button>
            ) : (
                <span className="text-xs text-slate-400">Passo 1 de 2</span>
            )}
            
            {step === 1 && (
                <Button 
                    onClick={() => setStep(2)} 
                    disabled={rawData.length === 0}
                    className="bg-primary hover:bg-primary/90 pl-6 pr-4"
                >
                    Próximo: Definir Metas <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}

            {step === 2 && (
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 gap-2 pl-6 pr-6 shadow-md hover:shadow-lg transition-all"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Salvando..." : "Salvar Playbook e Metas"}
                </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
