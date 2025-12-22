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
import { Loader2, Target, Edit3, DollarSign, TrendingUp, BarChart3, Users, Plus, Trash2 } from "lucide-react";
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
  squad_id: string | null; // Agora usamos ID do squad
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
  const [isSquadsModalOpen, setIsSquadsModalOpen] = useState(false); // Modal de Gestão de Squads

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

          // 2. Squads (NOVO)
          const { data: squadsData } = await supabase
            .from("squads" as any)
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .order("nome");

          if (squadsData) setSquads(squadsData);

          // 3. Obras
          const { data: obrasData } = await supabase
            .from("obras" as any)
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, squad_id, status")
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

  // --- AÇÕES DE SQUAD ---
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
      setSquads([...squads, data]);
      setNovoSquadNome("");
      toast({ title: "Squad criado!" });
    } catch (e) {
      toast({ title: "Erro ao criar squad", variant: "destructive" });
    }
  };

  const handleDeleteSquad = async (id: string) => {
    try {
      // Primeiro remove vínculo das obras
      await supabase
        .from("obras" as any)
        .update({ squad_id: null })
        .eq("squad_id", id);
      // Depois deleta
      await supabase
        .from("squads" as any)
        .delete()
        .eq("id", id);

      setSquads(squads.filter((s) => s.id !== id));
      // Atualiza estado local das obras para remover o ID deletado
      setObras((prev) => prev.map((o) => (o.squad_id === id ? { ...o, squad_id: null } : o)));
      toast({ title: "Squad removido" });
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  // --- AÇÕES DE META ---
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Agrupamento por Squad para o Dashboard
  const rankingSquads = squads
    .map((squad) => {
      const obrasDoSquad = obrasConsideradas.filter((o) => o.squad_id === squad.id);
      const fat = obrasDoSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
      const luc = obrasDoSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
      return {
        ...squad,
        faturamento: fat,
        lucro: luc,
        margem: fat > 0 ? (luc / fat) * 100 : 0,
        contrib: meta.meta_faturamento > 0 ? (fat / meta.meta_faturamento) * 100 : 0,
        qtd_obras: obrasDoSquad.length,
      };
    })
    .sort((a, b) => b.faturamento - a.faturamento);

  // Obras sem squad
  const obrasSemSquad = obrasConsideradas.filter((o) => !o.squad_id);
  const fatSemSquad = obrasSemSquad.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  if (fatSemSquad > 0) {
    rankingSquads.push({
      id: "sem-squad",
      nome: "Sem Squad Definido",
      faturamento: fatSemSquad,
      lucro: obrasSemSquad.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0),
      margem: 0,
      contrib: meta.meta_faturamento > 0 ? (fatSemSquad / meta.meta_faturamento) * 100 : 0,
      qtd_obras: obrasSemSquad.length,
    } as any);
  }

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
            Performance por Squad
          </h1>
          <p className="text-slate-500">Gestão estratégica de metas e engenheiros.</p>
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
                Gerenciar Squads
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Faturamento */}
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
              <Progress value={Math.min(percentualMeta, 100)} className="h-2 bg-slate-700 [&>*]:bg-[#C7A347]" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Margem */}
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

        {/* Card 3: Top Squad */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Top Squad</CardTitle>
          </CardHeader>
          <CardContent>
            {rankingSquads.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700 font-bold">1º</div>
                  <div className="text-xl font-bold text-[#112131]">{rankingSquads[0].nome}</div>
                </div>
                <div className="text-sm text-slate-500 mb-2">
                  Contribuição:{" "}
                  <span className="font-bold text-[#C7A347]">{formatCurrency(rankingSquads[0].faturamento)}</span>
                </div>
                <div className="text-xs text-slate-400">{rankingSquads[0].qtd_obras} obras vinculadas</div>
              </>
            ) : (
              <div className="text-slate-400 py-4 text-center text-sm">Nenhum dado registrado</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- RANKING DE SQUADS --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#112131] flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#C7A347]" />
          Ranking dos Engenheiros (Squads)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankingSquads.map((squad) => (
            <div
              key={squad.id}
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-[#112131] text-lg">{squad.nome}</h3>
                <Badge variant="outline" className="border-[#C7A347] text-[#C7A347] bg-[#C7A347]/5">
                  {squad.contrib.toFixed(1)}% do Alvo
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Obras Ativas</span>
                  <span className="font-semibold text-[#112131]">{squad.qtd_obras}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Faturamento</span>
                  <span className="font-semibold text-[#112131]">{formatCurrency(squad.faturamento)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Margem Liq.</span>
                  <span
                    className={`font-bold ${squad.margem >= meta.meta_margem_liquida ? "text-green-600" : "text-amber-600"}`}
                  >
                    {squad.margem.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {rankingSquads.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">Nenhum resultado lançado. Cadastre squads e vincule obras.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE LANÇAMENTO (TABELA) --- */}
      <Dialog open={isLancamentoModalOpen} onOpenChange={setIsLancamentoModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Lançamento por Obra - {anoSelecionado}</DialogTitle>
                <DialogDescription>Vincule as obras aos squads e lance os valores.</DialogDescription>
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
                    <TableHead className="w-[60px] text-center">Meta?</TableHead>
                    <TableHead className="min-w-[200px]">Obra</TableHead>
                    <TableHead className="min-w-[200px]">Squad (Engenheiro)</TableHead>
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
                        {/* Dropdown de Squads */}
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
