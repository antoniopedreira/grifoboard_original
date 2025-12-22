import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, Edit3, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TIPOS ---
interface MetaAnual {
  id?: string;
  ano: number;
  meta_faturamento: number;
  meta_margem_liquida: number;
}

interface ObraFinanceira {
  id: any;
  nome_obra: string;
  faturamento_realizado: number;
  lucro_realizado: number;
  considerar_na_meta: boolean;
  time_squad: string[] | null;
  status?: string;
}

const GestaoMetas = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

  // Modais
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);

  // Dados
  const [meta, setMeta] = useState<MetaAnual>({
    ano: new Date().getFullYear(),
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });
  const [tempMeta, setTempMeta] = useState<MetaAnual>(meta);
  const [obras, setObras] = useState<ObraFinanceira[]>([]);

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    const loadData = async () => {
      if (!userSession?.user?.id) return;
      setLoading(true);
      try {
        const { data: userData } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", userSession.user.id)
          .single();

        if (userData?.empresa_id) {
          // 1. Metas
          const { data: metaData } = await supabase
            .from("metas_anuais" as any)
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .eq("ano", parseInt(anoSelecionado))
            .maybeSingle();

          if (metaData) {
            const m = metaData as unknown as MetaAnual;
            setMeta(m);
            setTempMeta(m);
          } else {
            const emptyMeta = { ano: parseInt(anoSelecionado), meta_faturamento: 0, meta_margem_liquida: 0 };
            setMeta(emptyMeta);
            setTempMeta(emptyMeta);
          }

          // 2. Obras
          const { data: obrasData } = await supabase
            .from("obras" as any)
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, time_squad, status")
            .eq("empresa_id", userData.empresa_id)
            .order("nome_obra");

          if (obrasData) {
            setObras(obrasData as unknown as ObraFinanceira[]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userSession, anoSelecionado]);

  // --- AÇÕES ---

  const handleSaveMeta = async () => {
    try {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userSession.user!.id)
        .single();
      if (!userData?.empresa_id) return;

      const payload = {
        empresa_id: userData.empresa_id,
        ano: parseInt(anoSelecionado),
        meta_faturamento: tempMeta.meta_faturamento,
        meta_margem_liquida: tempMeta.meta_margem_liquida,
      };

      const { error } = await supabase.from("metas_anuais" as any).upsert(payload, { onConflict: "empresa_id, ano" });
      if (error) throw error;

      setMeta(tempMeta);
      setIsMetaModalOpen(false);
      toast({ title: "Sucesso", description: "Metas estratégicas atualizadas." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao salvar metas.", variant: "destructive" });
    }
  };

  const handleUpdateObra = async (id: any, field: string, value: any) => {
    setObras((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
    try {
      await supabase
        .from("obras" as any)
        .update({ [field]: value })
        .eq("id", id);
    } catch (e) {
      console.error(e);
    }
  };

  // --- CÁLCULOS KPI ---
  const obrasConsideradas = obras.filter((o) => o.considerar_na_meta);
  const totalFaturamento = obrasConsideradas.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  const totalLucro = obrasConsideradas.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);

  const margemAtual = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;
  const percentualMeta = meta.meta_faturamento > 0 ? (totalFaturamento / meta.meta_faturamento) * 100 : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#C7A347]" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#112131] flex items-center gap-2">
            <Target className="h-6 w-6 text-[#C7A347]" />
            Performance Financeira
          </h1>
          <p className="text-slate-500">Acompanhamento estratégico anual e resultados por squad.</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
            <SelectTrigger className="w-[100px] h-10 border-slate-200">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão Configurar Metas */}
          <Dialog open={isMetaModalOpen} onOpenChange={setIsMetaModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 text-slate-600 hover:text-[#C7A347] hover:border-[#C7A347]"
              >
                <Target className="h-4 w-4" />
                Definir Alvos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Metas Estratégicas ({anoSelecionado})</DialogTitle>
                <DialogDescription>Defina os objetivos globais da empresa.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Meta de Faturamento Anual</Label>
                  <Input
                    type="number"
                    value={tempMeta.meta_faturamento || ""}
                    onChange={(e) => setTempMeta({ ...tempMeta, meta_faturamento: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Meta de Margem Líquida (%)</Label>
                  <Input
                    type="number"
                    value={tempMeta.meta_margem_liquida || ""}
                    onChange={(e) => setTempMeta({ ...tempMeta, meta_margem_liquida: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveMeta} className="bg-[#112131]">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botão Lançar Resultados (Abre o Modal Grande) */}
          <Button
            onClick={() => setIsLancamentoModalOpen(true)}
            className="h-10 bg-[#C7A347] hover:bg-[#b08d3b] text-white gap-2 shadow-md transition-all hover:scale-105"
          >
            <Edit3 className="h-4 w-4" />
            Lançar Resultados
          </Button>
        </div>
      </div>

      {/* --- DASHBOARD VIEW (READ ONLY) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Progresso Faturamento */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#112131] to-[#1a334d] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-wider">
              Faturamento Realizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{formatCurrency(totalFaturamento)}</div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mb-4">
              <span>Meta: {formatCurrency(meta.meta_faturamento)}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>Progresso</span>
                <span>{percentualMeta.toFixed(1)}%</span>
              </div>

              {/* CORREÇÃO AQUI: Removemos indicatorClassName e usamos seletor CSS */}
              <Progress value={Math.min(percentualMeta, 100)} className="h-2 bg-slate-700 [&>*]:bg-[#C7A347]" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Margem Líquida */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Margem Líquida
            </CardTitle>
            <TrendingUp
              className={margemAtual >= meta.meta_margem_liquida ? "h-5 w-5 text-green-500" : "h-5 w-5 text-red-500"}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold mb-1 ${margemAtual >= meta.meta_margem_liquida ? "text-green-600" : "text-red-600"}`}
            >
              {margemAtual.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500 mb-4">
              Meta Alvo: <span className="font-bold">{meta.meta_margem_liquida}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Lucro Líquido</span>
              <span className="text-sm font-bold text-[#112131]">{formatCurrency(totalLucro)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Resumo Squads */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Squads Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl font-bold text-[#112131]">{obrasConsideradas.length}</div>
              <div className="text-xs text-slate-500 leading-tight">
                Obras contribuindo
                <br />
                para a meta anual.
              </div>
            </div>
            <div className="space-y-3">
              {obrasConsideradas.slice(0, 3).map((obra, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C7A347]"></div>
                    <span className="truncate max-w-[150px] font-medium text-slate-700">{obra.nome_obra}</span>
                  </div>
                  <span className="font-mono text-slate-500 text-xs">
                    {meta.meta_faturamento > 0
                      ? ((obra.faturamento_realizado / meta.meta_faturamento) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              ))}
              {obrasConsideradas.length > 3 && (
                <div className="text-xs text-center text-slate-400 mt-2">
                  e mais {obrasConsideradas.length - 3} obras...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- LISTAGEM VISUAL DE SQUADS (Ranking) --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#112131] flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#C7A347]" />
          Ranking de Contribuição
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obrasConsideradas
            .sort((a, b) => b.faturamento_realizado - a.faturamento_realizado)
            .map((obra) => {
              const percent =
                meta.meta_faturamento > 0 ? (obra.faturamento_realizado / meta.meta_faturamento) * 100 : 0;
              return (
                <div
                  key={obra.id}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#112131]">{obra.nome_obra}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {obra.time_squad && obra.time_squad.length > 0 ? (
                          obra.time_squad.map((m, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sem squad definido</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[#C7A347] border-[#C7A347] bg-[#C7A347]/5">
                      {percent.toFixed(2)}% do Alvo
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2 pt-3 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Faturamento</p>
                      <p className="font-semibold text-slate-700">{formatCurrency(obra.faturamento_realizado)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Lucro</p>
                      <p className="font-semibold text-slate-700">{formatCurrency(obra.lucro_realizado)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          {obrasConsideradas.length === 0 && (
            <div className="col-span-2 py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">Nenhum resultado lançado para o ano de {anoSelecionado}.</p>
              <Button variant="link" onClick={() => setIsLancamentoModalOpen(true)} className="text-[#C7A347]">
                Iniciar Lançamentos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE LANÇAMENTO (DETALHADO) --- */}
      <Dialog open={isLancamentoModalOpen} onOpenChange={setIsLancamentoModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Lançamento de Resultados - {anoSelecionado}</DialogTitle>
                <DialogDescription>Edite os valores realizados e a composição dos squads.</DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Total Selecionado</p>
                <p className="text-lg font-bold text-[#C7A347]">{formatCurrency(totalFaturamento)}</p>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 bg-slate-50/50">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Ativo</TableHead>
                    <TableHead className="min-w-[200px]">Obra</TableHead>
                    <TableHead className="min-w-[250px]">Squad (Nomes separados por vírgula)</TableHead>
                    <TableHead className="w-[180px]">Faturamento (R$)</TableHead>
                    <TableHead className="w-[180px]">Lucro (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obras.map((obra) => (
                    <TableRow key={obra.id} className={!obra.considerar_na_meta ? "opacity-50 bg-slate-50" : ""}>
                      <TableCell className="text-center">
                        <Switch
                          checked={obra.considerar_na_meta}
                          onCheckedChange={(checked) => handleUpdateObra(obra.id, "considerar_na_meta", checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {obra.nome_obra}
                        <div className="text-[10px] text-slate-400 uppercase">{obra.status}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 text-xs bg-white"
                          placeholder="Ex: Ana, João..."
                          defaultValue={obra.time_squad ? obra.time_squad.join(", ") : ""}
                          onBlur={(e) => {
                            const val = e.target.value;
                            const list = val.trim()
                              ? val
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : [];
                            handleUpdateObra(obra.id, "time_squad", list);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.faturamento_realizado}
                          onChange={(e) =>
                            handleUpdateObra(obra.id, "faturamento_realizado", parseFloat(e.target.value))
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.lucro_realizado}
                          onChange={(e) => handleUpdateObra(obra.id, "lucro_realizado", parseFloat(e.target.value))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t border-slate-100 bg-white">
            <Button onClick={() => setIsLancamentoModalOpen(false)} className="bg-[#112131] w-full sm:w-auto">
              Concluir Lançamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoMetas;
