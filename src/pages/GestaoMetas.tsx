import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Target, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetaAnual {
  id?: string;
  ano: number;
  meta_faturamento: number;
  meta_margem_liquida: number;
}

interface ObraFinanceira {
  id: any; // Tipagem flexível para aceitar number ou UUID (string)
  nome_obra: string;
  faturamento_realizado: number;
  lucro_realizado: number;
  considerar_na_meta: boolean;
  time_squad: string[] | null;
}

const GestaoMetas = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());

  // Dados
  const [meta, setMeta] = useState<MetaAnual>({
    ano: new Date().getFullYear(),
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });
  const [obras, setObras] = useState<ObraFinanceira[]>([]);

  // Carregar Dados
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
          // 1. Buscar Meta do Ano (Usando 'as any' para evitar erro de tipagem)
          const { data: metaData } = await supabase
            .from("metas_anuais" as any)
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .eq("ano", parseInt(anoSelecionado))
            .maybeSingle();

          if (metaData) {
            setMeta(metaData as MetaAnual);
          } else {
            setMeta({
              ano: parseInt(anoSelecionado),
              meta_faturamento: 0,
              meta_margem_liquida: 0,
            });
          }

          // 2. Buscar Obras (Usando 'as any' pois adicionamos colunas novas)
          const { data: obrasData } = await supabase
            .from("obras" as any)
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, time_squad")
            .eq("empresa_id", userData.empresa_id)
            .eq("status", "Ativa");

          if (obrasData) setObras(obrasData as ObraFinanceira[]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userSession, anoSelecionado]);

  // Salvar Meta Geral
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
        meta_faturamento: meta.meta_faturamento,
        meta_margem_liquida: meta.meta_margem_liquida,
      };

      const { error } = await supabase.from("metas_anuais" as any).upsert(payload, { onConflict: "empresa_id, ano" });

      if (error) throw error;
      toast({ title: "Sucesso", description: "Meta anual atualizada." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao salvar meta.", variant: "destructive" });
    }
  };

  // Salvar Obra Individual
  const handleUpdateObra = async (id: any, field: string, value: any) => {
    // Atualiza estado local
    setObras((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));

    try {
      await supabase
        .from("obras" as any)
        .update({ [field]: value })
        .eq("id", id);
    } catch (e) {
      console.error("Erro ao atualizar obra", e);
    }
  };

  // Cálculos Consolidados
  const obrasConsideradas = obras.filter((o) => o.considerar_na_meta);
  const totalFaturamento = obrasConsideradas.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  const totalLucro = obrasConsideradas.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
  const margemAtual = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;
  const percentualMeta = meta.meta_faturamento > 0 ? (totalFaturamento / meta.meta_faturamento) * 100 : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-[#C7A347]" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header e Seleção de Ano */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="h-6 w-6 text-[#C7A347]" />
            Gestão de Metas e Performance
          </h1>
          <p className="text-slate-500">Planejamento estratégico e acompanhamento de squads.</p>
        </div>
        <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Meta Faturamento */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Meta Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(meta.meta_faturamento)}</div>
            <Input
              type="number"
              className="mt-2 h-8 text-xs bg-slate-50"
              placeholder="Definir Meta..."
              value={meta.meta_faturamento || ""}
              onChange={(e) => setMeta({ ...meta, meta_faturamento: parseFloat(e.target.value) || 0 })}
              onBlur={handleSaveMeta}
            />
          </CardContent>
        </Card>

        {/* Realizado */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Realizado (Obras Sel.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalFaturamento)}</div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>{percentualMeta.toFixed(1)}% atingido</span>
            </div>
            <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-1000"
                style={{ width: `${Math.min(percentualMeta, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lucro & Margem */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Lucro & Margem Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalLucro)}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={margemAtual >= meta.meta_margem_liquida ? "secondary" : "destructive"}
                className="text-xs"
              >
                {margemAtual.toFixed(2)}% Margem
              </Badge>
              <span className="text-xs text-slate-400">Meta: {meta.meta_margem_liquida}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Meta Margem */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Meta Margem Líquida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.meta_margem_liquida}%</div>
            <Input
              type="number"
              className="mt-2 h-8 text-xs bg-slate-50"
              placeholder="Definir %..."
              value={meta.meta_margem_liquida || ""}
              onChange={(e) => setMeta({ ...meta, meta_margem_liquida: parseFloat(e.target.value) || 0 })}
              onBlur={handleSaveMeta}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Obras e Squads */}
      <Card className="shadow-md border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
            <Users className="h-5 w-5 text-[#C7A347]" /> Detalhamento por Squad (Obras)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] text-center">Meta?</TableHead>
                <TableHead className="w-[250px]">Obra</TableHead>
                <TableHead>Time (Membros)</TableHead>
                <TableHead className="text-right w-[150px]">Faturamento</TableHead>
                <TableHead className="text-right w-[150px]">Lucro</TableHead>
                <TableHead className="text-center w-[120px]">% Contrib.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Nenhuma obra ativa encontrada nesta empresa.
                  </TableCell>
                </TableRow>
              ) : (
                obras.map((obra) => {
                  const contrib =
                    meta.meta_faturamento > 0 ? (obra.faturamento_realizado / meta.meta_faturamento) * 100 : 0;

                  const squadTexto = obra.time_squad ? obra.time_squad.join(", ") : "";

                  return (
                    <TableRow
                      key={obra.id}
                      className={!obra.considerar_na_meta ? "opacity-60 bg-slate-50" : "hover:bg-slate-50/50"}
                    >
                      <TableCell className="text-center">
                        <Switch
                          checked={obra.considerar_na_meta}
                          onCheckedChange={(checked) => handleUpdateObra(obra.id, "considerar_na_meta", checked)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{obra.nome_obra}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 py-1">
                          <Input
                            className="h-8 text-xs w-full min-w-[200px]"
                            placeholder="Ex: Matheus, João, Ana..."
                            defaultValue={squadTexto}
                            onBlur={(e) => {
                              const texto = e.target.value;
                              if (!texto.trim()) {
                                handleUpdateObra(obra.id, "time_squad", []);
                              } else {
                                const listaNomes = texto
                                  .split(",")
                                  .map((nome) => nome.trim())
                                  .filter(Boolean);
                                handleUpdateObra(obra.id, "time_squad", listaNomes);
                              }
                            }}
                          />
                          {obra.time_squad && obra.time_squad.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {obra.time_squad.map((membro, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100"
                                >
                                  {membro}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 relative">
                          <span className="text-[10px] text-slate-400 absolute left-2 top-2">R$</span>
                          <Input
                            type="number"
                            className="h-8 pl-6 text-right font-mono text-xs"
                            value={obra.faturamento_realizado || 0}
                            onChange={(e) =>
                              handleUpdateObra(obra.id, "faturamento_realizado", parseFloat(e.target.value))
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 relative">
                          <span className="text-[10px] text-slate-400 absolute left-2 top-2">R$</span>
                          <Input
                            type="number"
                            className="h-8 pl-6 text-right font-mono text-xs"
                            value={obra.lucro_realizado || 0}
                            onChange={(e) => handleUpdateObra(obra.id, "lucro_realizado", parseFloat(e.target.value))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-white font-mono font-normal">
                          {contrib.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoMetas;
