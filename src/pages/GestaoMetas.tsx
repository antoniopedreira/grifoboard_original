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
  LayoutGrid,
  Settings,
  Save,
  Star,
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

// "Squad" agora representa um Usuário do sistema
interface UsuarioResponsavel {
  id: string;
  nome: string;
}

interface ObraFinanceira {
  id: any;
  nome_obra: string;
  faturamento_realizado: number;
  lucro_realizado: number;
  considerar_na_meta: boolean;
  squad_id: string | null; // Mantemos o nome squad_id no banco para compatibilidade, mas guarda o ID do usuário
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
  const [viewMode, setViewMode] = useState<"responsavel" | "obra">("responsavel");

  // Modais
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isLancamentoModalOpen, setIsLancamentoModalOpen] = useState(false);

  // Estados de Edição (Metas Gerais)
  const [tempMeta, setTempMeta] = useState<MetaAnual>({
    ano: 2026,
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });

  // ESTADO LOCAL PARA EDIÇÃO EM MASSA (Obras)
  // Isso resolve a lentidão: editamos aqui e salvamos tudo de uma vez.
  const [localObras, setLocalObras] = useState<ObraFinanceira[]>([]);
  const [isSavingObras, setIsSavingObras] = useState(false);

  // --- QUERY PRINCIPAL (Data Fetching) ---
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

      // 3. Pegar Usuários da Empresa (Para usar como responsáveis/squads)
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("id, nome")
        .eq("empresa_id", userData.empresa_id)
        .order("nome");

      const responsaveis: UsuarioResponsavel[] = (usuariosData || []).map((u) => ({
        id: u.id,
        nome: u.nome || "Usuário sem nome",
      }));

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
        responsaveis,
        obras: (obrasData || []) as unknown as ObraFinanceira[],
      };
    },
    enabled: !!userSession?.user?.id,
    staleTime: 1000 * 60 * 10,
  });

  // Sincroniza estado temporário das metas
  useEffect(() => {
    if (dashboardData?.meta) {
      setTempMeta(dashboardData.meta);
    }
  }, [dashboardData]);

  // --- LÓGICA DE EDIÇÃO LOCAL (Obras) ---

  const handleOpenLancamento = (open: boolean) => {
    if (open && dashboardData?.obras) {
      // Clona os dados para evitar mutação direta e resetar ao abrir
      setLocalObras(JSON.parse(JSON.stringify(dashboardData.obras)));
    }
    setIsLancamentoModalOpen(open);
  };

  const handleLocalChange = (id: any, field: keyof ObraFinanceira, value: any) => {
    setLocalObras((prev) =>
      prev.map((obra) => {
        if (obra.id === id) {
          return { ...obra, [field]: value };
        }
        return obra;
      }),
    );
  };

  // Salva tudo de uma vez
  const handleSaveAll = async () => {
    setIsSavingObras(true);
    try {
      const originalObras = dashboardData?.obras || [];
      const updates = [];

      for (const localObra of localObras) {
        const original = originalObras.find((o) => o.id === localObra.id);
        if (!original) continue;

        // Verifica se houve mudança para não enviar updates desnecessários
        const hasChanged =
          localObra.faturamento_realizado !== original.faturamento_realizado ||
          localObra.lucro_realizado !== original.lucro_realizado ||
          localObra.considerar_na_meta !== original.considerar_na_meta ||
          localObra.squad_id !== original.squad_id ||
          localObra.nps !== original.nps ||
          localObra.data_inicio !== original.data_inicio;

        if (hasChanged) {
          updates.push(
            supabase
              .from("obras" as any)
              .update({
                faturamento_realizado: localObra.faturamento_realizado,
                lucro_realizado: localObra.lucro_realizado,
                considerar_na_meta: localObra.considerar_na_meta,
                squad_id: localObra.squad_id, // Salva o ID do usuário aqui
                nps: localObra.nps,
                data_inicio: localObra.data_inicio,
              })
              .eq("id", localObra.id),
          );
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
        await queryClient.invalidateQueries({ queryKey: ["gestaoMetas"] });
        toast({ title: `${updates.length} registros atualizados!` });
      } else {
        toast({ title: "Nenhuma alteração detectada." });
      }

      setIsLancamentoModalOpen(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar alterações", variant: "destructive" });
    } finally {
      setIsSavingObras(false);
    }
  };

  // --- MUTATION (Metas Globais) ---
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
  const responsaveis = dashboardData?.responsaveis || [];

  const obrasConsideradas = obras.filter((o) => o.considerar_na_meta);
  const totalFaturamento = obrasConsideradas.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  const totalLucro = obrasConsideradas.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
  const margemAtual = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;
  const percentualMeta = meta.meta_faturamento > 0 ? (totalFaturamento / meta.meta_faturamento) * 100 : 0;

  const obrasComNps = obrasConsideradas.filter((o) => o.nps !== null && o.nps !== undefined);
  const npsMedioEmpresa =
    obrasComNps.length > 0 ? obrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / obrasComNps.length : 0;

  // Ranking Responsáveis
  const rankingResponsaveis = responsaveis
    .map((resp) => {
      const obrasDoResp = obrasConsideradas.filter((o) => o.squad_id === resp.id);
      const fat = obrasDoResp.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
      const luc = obrasDoResp.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
      const respObrasComNps = obrasDoResp.filter((o) => o.nps !== null);
      const npsMedio =
        respObrasComNps.length > 0
          ? respObrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / respObrasComNps.length
          : null;

      return {
        ...resp,
        faturamento: fat,
        lucro: luc,
        margem: fat > 0 ? (luc / fat) * 100 : 0,
        contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
        qtd_obras: obrasDoResp.length,
        nps_medio: npsMedio,
      };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  const topResponsavel = rankingResponsaveis.length > 0 ? rankingResponsaveis[0] : null;

  // Obras sem responsável
  const obrasSemResponsavel = obrasConsideradas.filter((o) => !o.squad_id);
  if (obrasSemResponsavel.length > 0) {
    const fat = obrasSemResponsavel.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
    const luc = obrasSemResponsavel.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
    const respObrasComNps = obrasSemResponsavel.filter((o) => o.nps !== null);
    const npsMedio =
      respObrasComNps.length > 0
        ? respObrasComNps.reduce((acc, curr) => acc + (curr.nps || 0), 0) / respObrasComNps.length
        : null;

    rankingResponsaveis.push({
      id: "sem-responsavel",
      nome: "Sem Responsável",
      faturamento: fat,
      lucro: luc,
      margem: fat > 0 ? (luc / fat) * 100 : 0,
      contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
      qtd_obras: obrasSemResponsavel.length,
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
                <DialogDescription>Defina as metas anuais da empresa.</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="metas" className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-1 bg-slate-100">
                  <TabsTrigger value="metas">Metas Anuais</TabsTrigger>
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
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* Botão Lançar Resultados */}
          <Button
            onClick={() => handleOpenLancamento(true)}
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

        {/* Card 3: Top Responsável (DETALHADO) */}
        <Card className="border-0 shadow-md bg-white col-span-1">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Top 1 Responsável
            </CardTitle>
            {topResponsavel && (
              <Badge className="bg-[#C7A347] text-white hover:bg-[#b08d3b] text-[10px] px-1.5">Campeão</Badge>
            )}
          </CardHeader>
          <CardContent>
            {topResponsavel ? (
              <div className="space-y-3">
                <div className="text-xl font-bold text-[#112131] truncate border-b border-slate-100 pb-2">
                  {topResponsavel.nome}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Faturamento</p>
                    <p className="text-sm font-bold text-[#112131]">{formatCurrency(topResponsavel.faturamento)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Lucro Líq.</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(topResponsavel.lucro)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">Margem</p>
                    <p
                      className={`text-sm font-bold ${topResponsavel.margem >= meta.meta_margem_liquida ? "text-green-600" : "text-amber-500"}`}
                    >
                      {topResponsavel.margem.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase">NPS Médio</p>
                    {topResponsavel.nps_medio !== null ? (
                      <Badge
                        variant="outline"
                        className={`${getNpsColor(topResponsavel.nps_medio)} text-[10px] px-1 h-5`}
                      >
                        {topResponsavel.nps_medio.toFixed(1)}
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
              onClick={() => setViewMode("responsavel")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "responsavel" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Users className="h-3 w-3" /> Responsáveis
            </button>
            <button
              onClick={() => setViewMode("obra")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === "obra" ? "bg-white shadow-sm text-[#112131]" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="h-3 w-3" /> Obras
            </button>
          </div>
        </div>

        {viewMode === "responsavel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankingResponsaveis.map((resp) => (
              <div
                key={resp.id}
                className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#112131] text-lg">{resp.nome}</h3>
                    <p className="text-xs text-slate-400">
                      {resp.qtd_obras} obras em {anoSelecionado}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-[#C7A347] text-[#C7A347] bg-[#C7A347]/5">
                    {resp.contrib.toFixed(1)}% do Alvo
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Faturamento</span>
                    <span className="font-semibold text-[#112131]">{formatCurrency(resp.faturamento)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Margem Liq.</span>
                    <span
                      className={`font-bold ${resp.margem >= meta.meta_margem_liquida ? "text-green-600" : "text-amber-600"}`}
                    >
                      {resp.margem.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2 mt-2">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Star className="h-3 w-3" /> NPS Médio
                    </span>
                    {resp.nps_medio !== null ? (
                      <Badge variant="outline" className={getNpsColor(resp.nps_medio)}>
                        {resp.nps_medio.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {rankingResponsaveis.length === 0 && (
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
                      {responsaveis.find((s) => s.id === obra.squad_id)?.nome || "Sem Responsável"}
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

      {/* --- MODAL DE LANÇAMENTO (TABELA COMPLETA COM ESTADO LOCAL) --- */}
      <Dialog open={isLancamentoModalOpen} onOpenChange={handleOpenLancamento}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Lançamento de Resultados - {anoSelecionado}</DialogTitle>
                <DialogDescription>Edite os dados e clique em "Concluir" para salvar.</DialogDescription>
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
                    <TableHead className="w-[50px] text-center">Ativa?</TableHead>
                    <TableHead className="min-w-[150px]">Obra</TableHead>
                    <TableHead className="w-[130px]">Início (Ano)</TableHead>
                    <TableHead className="min-w-[150px]">Responsável</TableHead>
                    <TableHead className="w-[140px]">Faturamento</TableHead>
                    <TableHead className="w-[140px]">Lucro</TableHead>
                    <TableHead className="w-[90px]">NPS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localObras.map((obra) => (
                    <TableRow key={obra.id} className={!obra.considerar_na_meta ? "opacity-50 bg-slate-50" : ""}>
                      <TableCell className="text-center">
                        <Switch
                          checked={obra.considerar_na_meta}
                          onCheckedChange={(checked) => handleLocalChange(obra.id, "considerar_na_meta", checked)}
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
                          onChange={(e) => handleLocalChange(obra.id, "data_inicio", e.target.value)}
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          value={obra.squad_id || "none"}
                          onValueChange={(val) => handleLocalChange(obra.id, "squad_id", val === "none" ? null : val)}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white w-full">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-slate-400 italic">
                              Sem Responsável
                            </SelectItem>
                            {responsaveis.map((resp) => (
                              <SelectItem key={resp.id} value={resp.id}>
                                {resp.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0,00"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.faturamento_realizado === 0 ? "" : obra.faturamento_realizado}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            handleLocalChange(obra.id, "faturamento_realizado", val);
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0,00"
                          className="h-8 text-right bg-white font-mono text-xs"
                          value={obra.lucro_realizado === 0 ? "" : obra.lucro_realizado}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                            handleLocalChange(obra.id, "lucro_realizado", val);
                          }}
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
                            handleLocalChange(obra.id, "nps", val);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t border-slate-100 bg-white gap-2">
            <Button variant="outline" onClick={() => setIsLancamentoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAll}
              className="bg-[#112131] w-full sm:w-auto min-w-[120px]"
              disabled={isSavingObras}
            >
              {isSavingObras ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoMetas;
