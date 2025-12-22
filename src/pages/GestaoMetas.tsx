import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Settings,
  Save,
  CalendarDays,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  nps: number | null;
  data_inicio: string | null;
  status?: string;
}

const GestaoMetas = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filtros
  const [anoSelecionado, setAnoSelecionado] = useState("2026");
  const [viewMode, setViewMode] = useState<"squad" | "obra">("squad");

  // Modais
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);

  // Estados de Edição (Temporários)
  const [tempMeta, setTempMeta] = useState<MetaAnual>({
    ano: 2026,
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });
  const [novoSquadNome, setNovoSquadNome] = useState("");

  // --- QUERY PRINCIPAL (Data Fetching com Cache) ---
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["gestaoMetas", userSession?.user?.id, anoSelecionado],
    queryFn: async () => {
      if (!userSession?.user?.id) throw new Error("Usuário não logado");

      // 1. Pegar Empresa ID
      const { data: userData } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userSession.user.id)
        .single();

      if (!userData?.empresa_id) throw new Error("Empresa não encontrada");

      // 2. Pegar Metas
      const { data: metaData } = await supabase
        .from("metas_anuais" as any)
        .select("*")
        .eq("empresa_id", userData.empresa_id)
        .eq("ano", parseInt(anoSelecionado))
        .maybeSingle();

      const meta = metaData
        ? (metaData as unknown as MetaAnual)
        : { ano: parseInt(anoSelecionado), meta_faturamento: 0, meta_margem_liquida: 0 };

      // 3. Pegar Squads
      const { data: squadsData } = await supabase
        .from("squads" as any)
        .select("*")
        .eq("empresa_id", userData.empresa_id)
        .order("nome");

      // 4. Pegar Obras do Ano
      const dataInicioAno = `${anoSelecionado}-01-01`;
      const dataFimAno = `${anoSelecionado}-12-31`;

      const { data: obrasData } = await supabase
        .from("obras" as any)
        .select(
          "id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, squad_id, nps, data_inicio, status",
        )
        .eq("empresa_id", userData.empresa_id)
        .gte("data_inicio", dataInicioAno)
        .lte("data_inicio", dataFimAno)
        .order("nome_obra");

      return {
        empresa_id: userData.empresa_id,
        meta,
        squads: (squadsData || []) as unknown as Squad[],
        obras: (obrasData || []) as unknown as ObraFinanceira[],
      };
    },
    enabled: !!userSession?.user?.id,
    staleTime: 1000 * 60 * 10, // Cache por 10 minutos (Evita recarregamento ao voltar para a página)
  });

  // Atualizar o estado temporário do modal quando os dados chegarem
  useEffect(() => {
    if (dashboardData?.meta) {
      setTempMeta(dashboardData.meta);
    }
  }, [dashboardData]);

  // --- MUTATIONS (Salvar Dados) ---
  const saveMetaMutation = useMutation({
    mutationFn: async (newMeta: MetaAnual) => {
      const payload = {
        empresa_id: dashboardData?.empresa_id,
        ano: parseInt(anoSelecionado),
        meta_faturamento: newMeta.meta_faturamento,
        meta_margem_liquida: newMeta.meta_margem_liquida,
      };
      const { error } = await supabase.from("metas_anuais" as any).upsert(payload, { onConflict: "empresa_id, ano" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestaoMetas"] });
      toast({ title: "Metas atualizadas!" });
    },
    onError: () => toast({ title: "Erro ao salvar metas", variant: "destructive" }),
  });

  const addSquadMutation = useMutation({
    mutationFn: async () => {
      if (!novoSquadNome.trim()) return;
      const { error } = await supabase
        .from("squads" as any)
        .insert({ empresa_id: dashboardData?.empresa_id, nome: novoSquadNome });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestaoMetas"] });
      setNovoSquadNome("");
      toast({ title: "Squad criado!" });
    },
    onError: () => toast({ title: "Erro ao criar squad", variant: "destructive" }),
  });

  const deleteSquadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("obras" as any)
        .update({ squad_id: null })
        .eq("squad_id", id);
      await supabase
        .from("squads" as any)
        .delete()
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestaoMetas"] });
      toast({ title: "Squad removido!" });
    },
  });

  const updateObraMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: any; field: string; value: any }) => {
      const { error } = await supabase
        .from("obras" as any)
        .update({ [field]: value })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gestaoMetas"] });
    },
  });

  // Helpers
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  const getNpsColor = (score: number) => {
    if (score >= 9) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 7) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  // --- CÁLCULOS KPI ---
  const meta = dashboardData?.meta || { meta_faturamento: 0, meta_margem_liquida: 0 };
  const obras = dashboardData?.obras || [];
  const squads = dashboardData?.squads || [];

  const obrasConsideradas = obras.filter((o) => o.considerar_na_meta);
  const totalFaturamento = obrasConsideradas.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  const totalLucro = obrasConsideradas.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
  const margemAtual = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;
  const percentualMeta = meta.meta_faturamento > 0 ? (totalFaturamento / meta.meta_faturamento) * 100 : 0;

  const obrasComNps = obrasConsideradas.filter((o) => o.nps !== null && o.nps !== undefined);
  const npsMedioEmpresa =
    obrasComNps.length > 0 ? obrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / obrasComNps.length : 0;

  // Ranking Squads
  const rankingSquads = squads
    .map((squad) => {
      const obrasDoSquad = obrasConsideradas.filter((o) => o.squad_id === squad.id);
      const fat = obrasDoSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
      const luc = obrasDoSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
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

  const topSquad = rankingSquads.length > 0 ? rankingSquads[0] : null;

  // Obras sem squad
  const obrasSemSquad = obrasConsideradas.filter((o) => !o.squad_id);
  if (obrasSemSquad.length > 0) {
    const fat = obrasSemSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
    const luc = obrasSemSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
    const squadObrasComNps = obrasSemSquad.filter((o) => o.nps !== null);
    const npsMedio =
      squadObrasComNps.length > 0
        ? squadObrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / squadObrasComNps.length
        : null;

    rankingSquads.push({
      id: "sem-squad",
      nome: "Sem Squad Definido",
      faturamento: fat,
      lucro: luc,
      margem: fat > 0 ? (luc / fat) * 100 : 0,
      contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
      qtd_obras: obrasSemSquad.length,
      nps_medio: npsMedio,
    } as any);
  }

  const rankingObras = [...obrasConsideradas].sort((a, b) => b.faturamento_realizado - a.faturamento_realizado);

  if (isLoading)
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
              <SelectItem value="2027">2027</SelectItem>
            </SelectContent>
          </Select>

          {/* BOTÃO ÚNICO DE CONFIGURAÇÕES */}
          <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 text-slate-600 hover:text-[#C7A347] hover:border-[#C7A347]"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Configurações de Gestão</DialogTitle>
                <DialogDescription>Gerencie metas anuais e squads da empresa.</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="metas" className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger value="metas">Metas Anuais</TabsTrigger>
                  <TabsTrigger value="squads">Gestão de Squads</TabsTrigger>
                </TabsList>

                {/* ABA METAS */}
                <TabsContent value="metas" className="space-y-4 py-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Meta de Faturamento ({anoSelecionado})</Label>
                      <Input
                        type="number"
                        value={tempMeta.meta_faturamento}
                        onChange={(e) =>
                          setTempMeta({ ...tempMeta, meta_faturamento: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Meta de Margem Líquida (%)</Label>
                      <Input
                        type="number"
                        value={tempMeta.meta_margem_liquida}
                        onChange={(e) =>
                          setTempMeta({ ...tempMeta, meta_margem_liquida: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => saveMetaMutation.mutate(tempMeta)}
                      className="bg-[#112131] w-full mt-2 gap-2"
                    >
                      {saveMetaMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Metas
                    </Button>
                  </div>
                </TabsContent>

                {/* ABA SQUADS */}
                <TabsContent value="squads" className="space-y-4 py-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome do Squad (Ex: Squad Heitor)"
                      value={novoSquadNome}
                      onChange={(e) => setNovoSquadNome(e.target.value)}
                    />
                    <Button onClick={() => addSquadMutation.mutate()} className="bg-[#C7A347] hover:bg-[#b08d3b]">
                      {addSquadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2 bg-slate-50">
                    {squads.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">Nenhum squad cadastrado.</p>
                    )}
                    {squads.map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center p-2 bg-white rounded border border-slate-100 shadow-sm"
                      >
                        <span className="font-medium text-slate-700 text-sm">{s.nome}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSquadMutation.mutate(s.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Botão Lançar Resultados */}
          <Button
            onClick={() => setIsLancamentoModalOpen(true)}
            className="h-10 bg-[#C7A347] hover:bg-[#b08d3b] text-white gap-2 shadow-md transition-all hover:scale-105"
          >
            <Edit3 className="h-4 w-4" /> Lançar Resultados
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

            {/* Meta Alvo Destacada */}
            <div className="flex items-center gap-2 mb-2 bg-white/10 p-1.5 rounded-md w-fit">
              <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Meta:</span>
              <span className="text-sm font-semibold text-[#C7A347]">{formatCurrency(meta.meta_faturamento)}</span>
            </div>

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

        {/* Card 3: Top Squad (DETALHADO) */}
        <Card className="border-0 shadow-md bg-white col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top 1 Squad</CardTitle>
            {topSquad && (
              <Badge className="bg-[#C7A347] text-white hover:bg-[#b08d3b] text-[10px] px-1.5">Campeão</Badge>
            )}
          </CardHeader>
          <CardContent>
            {topSquad ? (
              <div className="space-y-3">
                <div className="text-xl font-bold text-[#112131] truncate border-b border-slate-100 pb-2">
                  {topSquad.nome}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Faturamento</p>
                    <p className="text-sm font-bold text-[#112131]">{formatCurrency(topSquad.faturamento)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Lucro Líq.</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(topSquad.lucro)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Margem</p>
                    <p
                      className={`text-sm font-bold ${topSquad.margem >= meta.meta_margem_liquida ? "text-green-600" : "text-amber-500"}`}
                    >
                      {topSquad.margem.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">NPS Médio</p>
                    {topSquad.nps_medio !== null ? (
                      <Badge variant="outline" className={`${getNpsColor(topSquad.nps_medio)} text-[10px] px-1 h-5`}>
                        {topSquad.nps_medio.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-300">-</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm py-4">Sem dados suficientes</div>
            )}
          </CardContent>
        </Card>

        {/* Card 4: NPS Médio Geral */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">NPS Global</CardTitle>
            <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-[#112131]">{npsMedioEmpresa.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mb-1">/ 10</div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Média ponderada da empresa</div>
            <div className="mt-3">
              <Progress value={npsMedioEmpresa * 10} className="h-1.5 bg-slate-100 [&>*]:bg-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- RANKING SWITCHER --- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#112131] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#C7A347]" /> Ranking de Performance
          </h2>
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode("squad")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "squad" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users className="h-3 w-3" /> Squads
            </button>
            <button
              onClick={() => setViewMode("obra")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "obra" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="h-3 w-3" /> Obras
            </button>
          </div>
        </div>

        {viewMode === "squad" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankingSquads.map((squad) => (
              <div
                key={squad.id}
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#112131] text-lg">{squad.nome}</h3>
                    <p className="text-xs text-slate-400">
                      {squad.qtd_obras} obras em {anoSelecionado}
                    </p>
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
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Star className="h-3 w-3" /> NPS Médio
                    </span>
                    {squad.nps_medio !== null ? (
                      <Badge variant="outline" className={getNpsColor(squad.nps_medio)}>
                        {squad.nps_medio.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {rankingSquads.length === 0 && (
              <p className="col-span-full text-center text-slate-400 py-10">
                Nenhum resultado encontrado em {anoSelecionado}.
              </p>
            )}
          </div>
        )}

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
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">
                      {squads.find((s) => s.id === obra.squad_id)?.nome || "Sem Squad"}
                    </p>
                  </div>
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
              <p className="col-span-full text-center text-slate-400 py-10">Nenhuma obra em {anoSelecionado}.</p>
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
                <DialogDescription>Dados financeiros e qualidade (NPS).</DialogDescription>
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
                    {/* CORREÇÃO: Título alterado para "Ativa?" */}
                    <TableHead className="w-[50px] text-center">Ativa?</TableHead>
                    <TableHead className="min-w-[150px]">Obra</TableHead>
                    <TableHead className="w-[130px]">Início (Ano)</TableHead>
                    <TableHead className="min-w-[150px]">Squad</TableHead>
                    <TableHead className="w-[140px]">Faturamento</TableHead>
                    <TableHead className="w-[140px]">Lucro</TableHead>
                    <TableHead className="w-[90px]">NPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obras.map((obra) => (
                    <TableRow key={obra.id} className={!obra.considerar_na_meta ? "opacity-50 bg-slate-50" : ""}>
                      <TableCell className="text-center">
                        <Switch
                          checked={obra.considerar_na_meta}
                          onCheckedChange={(checked) =>
                            updateObraMutation.mutate({ id: obra.id, field: "considerar_na_meta", value: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {obra.nome_obra}
                        <div className="text-[10px] text-slate-400 uppercase">{obra.status}</div>
                      </TableCell>

                      <TableCell>
                        <Input
                          type="date"
                          className="h-8 w-full text-xs bg-white"
                          value={obra.data_inicio || ""}
                          onChange={(e) =>
                            updateObraMutation.mutate({ id: obra.id, field: "data_inicio", value: e.target.value })
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          value={obra.squad_id || "none"}
                          onValueChange={(val) =>
                            updateObraMutation.mutate({
                              id: obra.id,
                              field: "squad_id",
                              value: val === "none" ? null : val,
                            })
                          }
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

                      {/* CORREÇÃO: Input de Faturamento com comportamento de placeholder zero */}
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0,00"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.faturamento_realizado === 0 ? "" : obra.faturamento_realizado}
                          onChange={(e) =>
                            updateObraMutation.mutate({
                              id: obra.id,
                              field: "faturamento_realizado",
                              value: e.target.value === "" ? 0 : parseFloat(e.target.value),
                            })
                          }
                        />
                      </TableCell>

                      {/* CORREÇÃO: Input de Lucro com comportamento de placeholder zero */}
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0,00"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.lucro_realizado === 0 ? "" : obra.lucro_realizado}
                          onChange={(e) =>
                            updateObraMutation.mutate({
                              id: obra.id,
                              field: "lucro_realizado",
                              value: e.target.value === "" ? 0 : parseFloat(e.target.value),
                            })
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          className="h-8 text-center bg-white font-bold text-xs"
                          placeholder="-"
                          value={obra.nps !== null ? obra.nps : ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? null : parseFloat(e.target.value);
                            if (val !== null && (val < 0 || val > 10)) return;
                            updateObraMutation.mutate({ id: obra.id, field: "nps", value: val });
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
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoMetas;
