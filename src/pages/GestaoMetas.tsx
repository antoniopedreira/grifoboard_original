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
import {
  Loader2,
  Target,
  Edit3,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Plus,
  Trash2,
  Star,
  LayoutGrid,
  List,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TIPOS ---
interface MetaAnual {
  id?: string;
  ano: number;
  meta_faturamento: number;
  meta_margem_liquida: number;
}

interface Squad {
  id: string;
  nome: string;
}

interface ObraFinanceira {
  id: any;
  nome_obra: string;
  faturamento_realizado: number;
  lucro_realizado: number;
  considerar_na_meta: boolean;
  squad_id: string | null;
  nps: number | null; // NOVO CAMPO
  status?: string;
}

const GestaoMetas = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState<"squad" | "obra">("squad"); // Toggle de Visualização

  // Modais
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);
  const [isSquadsModalOpen, setIsSquadsModalOpen] = useState(false);

  // Dados
  const [meta, setMeta] = useState<MetaAnual>({
    ano: new Date().getFullYear(),
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });
  const [tempMeta, setTempMeta] = useState<MetaAnual>(meta);
  const [obras, setObras] = useState<ObraFinanceira[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [novoSquadNome, setNovoSquadNome] = useState("");

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

          // 2. Squads
          const { data: squadsData } = await supabase
            .from("squads" as any)
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .order("nome");

          if (squadsData) {
            setSquads(squadsData as unknown as Squad[]);
          }

          // 3. Obras (Incluindo NPS agora)
          const { data: obrasData } = await supabase
            .from("obras" as any)
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, squad_id, nps, status")
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
  const handleAddSquad = async () => {
    if (!novoSquadNome.trim()) return;
    try {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userSession.user!.id)
        .single();
      const { data, error } = await supabase
        .from("squads" as any)
        .insert({ empresa_id: userData?.empresa_id, nome: novoSquadNome })
        .select()
        .single();

      if (error) throw error;
      const newSquad = data as unknown as Squad;
      setSquads([...squads, newSquad]);
      setNovoSquadNome("");
      toast({ title: "Squad criado!" });
    } catch (e) {
      toast({ title: "Erro ao criar squad", variant: "destructive" });
    }
  };

  const handleDeleteSquad = async (id: string) => {
    try {
      await supabase
        .from("obras" as any)
        .update({ squad_id: null })
        .eq("squad_id", id);
      await supabase
        .from("squads" as any)
        .delete()
        .eq("id", id);
      setSquads(squads.filter((s) => s.id !== id));
      setObras((prev) => prev.map((o) => (o.squad_id === id ? { ...o, squad_id: null } : o)));
      toast({ title: "Squad removido" });
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const handleSaveMeta = async () => {
    try {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userSession.user!.id)
        .single();
      const payload = {
        empresa_id: userData?.empresa_id,
        ano: parseInt(anoSelecionado),
        meta_faturamento: tempMeta.meta_faturamento,
        meta_margem_liquida: tempMeta.meta_margem_liquida,
      };

      const { error } = await supabase.from("metas_anuais" as any).upsert(payload, { onConflict: "empresa_id, ano" });
      if (error) throw error;

      setMeta(tempMeta);
      setIsMetaModalOpen(false);
      toast({ title: "Metas atualizadas." });
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
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

  // Cálculo NPS Médio da Empresa
  const obrasComNps = obrasConsideradas.filter((o) => o.nps !== null && o.nps !== undefined);
  const npsMedioEmpresa =
    obrasComNps.length > 0 ? obrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / obrasComNps.length : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Helper de Cores do NPS
  const getNpsColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-700 border-green-200"; // Promotor
    if (score >= 7) return "bg-yellow-100 text-yellow-700 border-yellow-200"; // Neutro
    return "bg-red-100 text-red-700 border-red-200"; // Detrator
  };

  // 1. Agrupamento por Squad (Ranking Squads)
  const rankingSquads = squads
    .map((squad) => {
      const obrasDoSquad = obrasConsideradas.filter((o) => o.squad_id === squad.id);
      const fat = obrasDoSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
      const luc = obrasDoSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);

      // NPS do Squad
      const squadObrasComNps = obrasDoSquad.filter((o) => o.nps !== null);
      const npsMedio =
        squadObrasComNps.length > 0
          ? squadObrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / squadObrasComNps.length
          : null;

      return {
        ...squad,
        faturamento: fat,
        lucro: luc,
        margem: fat > 0 ? (luc / fat) * 100 : 0,
        contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
        qtd_obras: obrasDoSquad.length,
        nps_medio: npsMedio,
      };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  // Adicionar "Sem Squad" se houver
  const obrasSemSquad = obrasConsideradas.filter((o) => !o.squad_id);
  if (obrasSemSquad.length > 0) {
    const fat = obrasSemSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
    const squadObrasComNps = obrasSemSquad.filter((o) => o.nps !== null);
    const npsMedio =
      squadObrasComNps.length > 0
        ? squadObrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / squadObrasComNps.length
        : null;

    rankingSquads.push({
      id: "sem-squad",
      nome: "Sem Squad Definido",
      faturamento: fat,
      lucro: obrasSemSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0),
      margem: fat > 0 ? (obrasSemSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0) / fat) * 100 : 0,
      contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
      qtd_obras: obrasSemSquad.length,
      nps_medio: npsMedio,
    } as any);
  }

  // 2. Ranking por Obra
  const rankingObras = [...obrasConsideradas].sort((a, b) => b.faturamento_realizado - a.faturamento_realizado);

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
            Performance & Qualidade
          </h1>
          <p className="text-slate-500">Gestão estratégica de metas, engenheiros e NPS.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          {/* Botão Squads */}
          <Dialog open={isSquadsModalOpen} onOpenChange={setIsSquadsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 text-slate-600">
                <Users className="h-4 w-4" />
                Squads
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastro de Squads</DialogTitle>
                <DialogDescription>Crie times com nomes dos engenheiros responsáveis.</DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 my-4">
                <Input
                  placeholder="Nome do Squad (Ex: Squad Heitor)"
                  value={novoSquadNome}
                  onChange={(e) => setNovoSquadNome(e.target.value)}
                />
                <Button onClick={handleAddSquad} className="bg-[#112131]">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {squads.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhum squad cadastrado.</p>
                )}
                {squads.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <span className="font-medium text-slate-700">{s.nome}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSquad(s.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Botão Metas */}
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

          {/* Botão Lançar Resultados */}
          <Button
            onClick={() => setIsLancamentoModalOpen(true)}
            className="h-10 bg-[#C7A347] hover:bg-[#b08d3b] text-white gap-2 shadow-md transition-all hover:scale-105"
          >
            <Edit3 className="h-4 w-4" />
            Lançar Resultados
          </Button>
        </div>
      </div>

      {/* --- DASHBOARD VIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Faturamento */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[#112131] to-[#1a334d] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="h-24 w-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-300 uppercase tracking-wider">Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalFaturamento)}</div>
            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-slate-300">Progresso</span>
              <span>{percentualMeta.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(percentualMeta, 100)} className="h-1.5 bg-slate-700 mt-1 [&>*]:bg-[#C7A347]" />
          </CardContent>
        </Card>

        {/* Card 2: Margem */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Margem Líquida
            </CardTitle>
            <TrendingUp
              className={margemAtual >= meta.meta_margem_liquida ? "h-4 w-4 text-green-500" : "h-4 w-4 text-red-500"}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold mb-1 ${margemAtual >= meta.meta_margem_liquida ? "text-green-600" : "text-red-600"}`}
            >
              {margemAtual.toFixed(2)}%
            </div>
            <div className="text-xs text-slate-500">
              Meta Alvo: <span className="font-bold">{meta.meta_margem_liquida}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Top Squad */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Top Squad (Fin.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankingSquads.length > 0 ? (
              <>
                <div className="text-xl font-bold text-[#112131] truncate">{rankingSquads[0].nome}</div>
                <div className="text-sm font-bold text-[#C7A347]">{formatCurrency(rankingSquads[0].faturamento)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Maior contribuição financeira</div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">N/A</div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: NPS Médio (NOVO) */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">NPS Médio</CardTitle>
            <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-[#112131]">{npsMedioEmpresa.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mb-1">/ 10</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Satisfação geral do cliente</div>
          </CardContent>
        </Card>
      </div>

      {/* --- RANKING SWITCHER & LIST --- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#112131] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#C7A347]" />
            Ranking de Performance
          </h2>

          {/* Toggle Squad vs Obra */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode("squad")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "squad" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users className="h-3 w-3" /> Por Squads
            </button>
            <button
              onClick={() => setViewMode("obra")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "obra" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="h-3 w-3" /> Por Obras
            </button>
          </div>
        </div>

        {/* --- VIEW: SQUADS --- */}
        {viewMode === "squad" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankingSquads.map((squad) => (
              <div
                key={squad.id}
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#112131] text-lg">{squad.nome}</h3>
                    <p className="text-xs text-slate-400">{squad.qtd_obras} obras ativas</p>
                  </div>
                  <Badge variant="outline" className="border-[#C7A347] text-[#C7A347] bg-[#C7A347]/5">
                    {squad.contrib.toFixed(1)}% do Alvo
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Faturamento</span>
                    <span className="font-semibold text-[#112131]">{formatCurrency(squad.faturamento)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Margem Liq.</span>
                    <span
                      className={`font-bold ${squad.margem >= meta.meta_margem_liquida ? "text-green-600" : "text-amber-600"}`}
                    >
                      {squad.margem.toFixed(2)}%
                    </span>
                  </div>
                  {/* NPS DO SQUAD */}
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Star className="h-3 w-3" /> NPS Médio
                    </span>
                    {squad.nps_medio !== null ? (
                      <Badge variant="outline" className={getNpsColor(squad.nps_medio)}>
                        {squad.nps_medio.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Sem avaliações</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {rankingSquads.length === 0 && (
              <p className="col-span-full text-center text-slate-400 py-10">Nenhum squad com obras vinculadas.</p>
            )}
          </div>
        )}

        {/* --- VIEW: OBRAS --- */}
        {viewMode === "obra" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankingObras.map((obra) => (
              <div
                key={obra.id}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[#112131] truncate max-w-[180px]" title={obra.nome_obra}>
                      {obra.nome_obra}
                    </h3>
                    {/* Nome do Squad abaixo da obra */}
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                      {squads.find((s) => s.id === obra.squad_id)?.nome || "Sem Squad"}
                    </p>
                  </div>
                  {/* NPS DA OBRA (Badge) */}
                  {obra.nps !== null && (
                    <Badge variant="outline" className={`${getNpsColor(obra.nps)} font-bold`}>
                      NPS {obra.nps}
                    </Badge>
                  )}
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
            ))}
            {rankingObras.length === 0 && (
              <p className="col-span-full text-center text-slate-400 py-10">Nenhuma obra lançada.</p>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL DE LANÇAMENTO (TABELA COMPLETA) --- */}
      <Dialog open={isLancamentoModalOpen} onOpenChange={setIsLancamentoModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Lançamento de Resultados - {anoSelecionado}</DialogTitle>
                <DialogDescription>Dados financeiros e de qualidade (NPS).</DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Faturamento Total</p>
                <p className="text-lg font-bold text-[#C7A347]">{formatCurrency(totalFaturamento)}</p>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 bg-slate-50/50">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">Meta?</TableHead>
                    <TableHead className="min-w-[200px]">Obra</TableHead>
                    <TableHead className="min-w-[180px]">Squad</TableHead>
                    <TableHead className="w-[150px]">Faturamento</TableHead>
                    <TableHead className="w-[150px]">Lucro</TableHead>
                    <TableHead className="w-[100px]">NPS (0-10)</TableHead>
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
                        <Select
                          value={obra.squad_id || "none"}
                          onValueChange={(val) => handleUpdateObra(obra.id, "squad_id", val === "none" ? null : val)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white w-full">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-slate-400 italic">
                              Sem Squad
                            </SelectItem>
                            {squads.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                      <TableCell>
                        {/* INPUT NPS */}
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          className="h-8 text-center bg-white font-bold text-xs"
                          placeholder="-"
                          value={obra.nps !== null ? obra.nps : ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : parseFloat(e.target.value);
                            if (val !== null && (val < 0 || val > 10)) return; // Trava visual simples
                            handleUpdateObra(obra.id, "nps", val);
                          }}
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
