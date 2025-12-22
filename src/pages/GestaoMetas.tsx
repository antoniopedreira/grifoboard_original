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
import { Loader2, Target, Users, Pencil, Save } from "lucide-react";
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
  status?: string; // Para debug
}

const GestaoMetas = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dados
  const [meta, setMeta] = useState<MetaAnual>({
    ano: new Date().getFullYear(),
    meta_faturamento: 0,
    meta_margem_liquida: 0,
  });

  // Estado temporário para o Modal (para não alterar a tela enquanto digita)
  const [tempMeta, setTempMeta] = useState<MetaAnual>(meta);

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
          console.log("Empresa ID:", userData.empresa_id);

          // 1. Buscar Meta do Ano
          const { data: metaData } = await supabase
            .from("metas_anuais" as any)
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .eq("ano", parseInt(anoSelecionado))
            .maybeSingle();

          if (metaData) {
            const m = metaData as unknown as MetaAnual;
            setMeta(m);
            setTempMeta(m); // Sincroniza o temp
          } else {
            const emptyMeta = {
              ano: parseInt(anoSelecionado),
              meta_faturamento: 0,
              meta_margem_liquida: 0,
            };
            setMeta(emptyMeta);
            setTempMeta(emptyMeta);
          }

          // 2. Buscar Obras (REMOVIDO O FILTRO DE STATUS 'ATIVA' PARA DEBUG)
          // Trazemos todas as obras da empresa para garantir que apareçam
          const { data: obrasData, error: obrasError } = await supabase
            .from("obras" as any)
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, time_squad, status")
            .eq("empresa_id", userData.empresa_id)
            .order("nome_obra");

          if (obrasError) {
            console.error("Erro ao buscar obras:", obrasError);
          }

          if (obrasData) {
            console.log("Obras encontradas:", obrasData);
            setObras(obrasData as unknown as ObraFinanceira[]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userSession, anoSelecionado]);

  // Salvar Meta (Vem do Modal)
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

      setMeta(tempMeta); // Atualiza a UI principal
      setIsModalOpen(false); // Fecha o modal
      toast({ title: "Sucesso", description: "Metas anuais atualizadas." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao salvar metas.", variant: "destructive" });
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
      {/* Header e Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="h-6 w-6 text-[#C7A347]" />
            Gestão de Metas e Performance
          </h1>
          <p className="text-slate-500">Planejamento estratégico e acompanhamento de squads.</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão para abrir o Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 border-[#C7A347] text-[#C7A347] hover:bg-[#C7A347]/10">
                <Pencil className="h-4 w-4" />
                Definir Metas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Definir Metas da Empresa ({anoSelecionado})</DialogTitle>
                <DialogDescription>Estabeleça os objetivos financeiros anuais para guiar os squads.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="metaFat">Meta de Faturamento (Anual)</Label>
                  <Input
                    id="metaFat"
                    type="number"
                    value={tempMeta.meta_faturamento || ""}
                    onChange={(e) => setTempMeta({ ...tempMeta, meta_faturamento: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="metaMargem">Meta de Margem Líquida (%)</Label>
                  <div className="relative">
                    <Input
                      id="metaMargem"
                      type="number"
                      value={tempMeta.meta_margem_liquida || ""}
                      onChange={(e) =>
                        setTempMeta({ ...tempMeta, meta_margem_liquida: parseFloat(e.target.value) || 0 })
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveMeta} className="bg-[#C7A347] hover:bg-[#b08d3b] gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Metas
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de KPIs (Agora Read-Only) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Meta Faturamento */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Meta Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(meta.meta_faturamento)}</div>
            <p className="text-xs text-slate-400 mt-1">Objetivo anual definido</p>
          </CardContent>
        </Card>

        {/* Realizado */}
        <Card className="border-l-4 border-l-green-500 shadow-sm bg-white">
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
        <Card className="border-l-4 border-l-amber-500 shadow-sm bg-white">
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
        <Card className="border-l-4 border-l-purple-500 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Meta Margem Líquida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{meta.meta_margem_liquida}%</div>
            <p className="text-xs text-slate-400 mt-1">Rentabilidade alvo</p>
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
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <p>Nenhuma obra encontrada nesta empresa.</p>
                      <p className="text-xs text-slate-400">Verifique se as obras estão cadastradas corretamente.</p>
                    </div>
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
                      <TableCell>
                        <div className="font-semibold text-slate-700">{obra.nome_obra}</div>
                        {/* Mostra o status para ajudar no debug */}
                        <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                          {obra.status || "Sem Status"}
                        </div>
                      </TableCell>
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
