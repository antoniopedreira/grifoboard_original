import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Target, TrendingUp, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetaAnual {
  id?: string;
  ano: number;
  meta_faturamento: number;
  meta_margem_liquida: number;
}

interface ObraFinanceira {
  id: number;
  nome_obra: string;
  faturamento_realizado: number;
  lucro_realizado: number;
  considerar_na_meta: boolean;
  time_squad: string[] | null; // Lista de nomes dos membros
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
    meta_margem_liquida: 0
  });
  const [obras, setObras] = useState<ObraFinanceira[]>([]);

  // Carregar Dados
  useEffect(() => {
    const loadData = async () => {
      if (!userSession?.user?.id) return;
      setLoading(true);
      try {
        // 1. Buscar ID da empresa do usuário (assumindo que está no metadata ou tabela usuarios)
        const { data: userData } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", userSession.user.id)
          .single();

        if (userData?.empresa_id) {
          // 2. Buscar Meta do Ano
          const { data: metaData } = await supabase
            .from("metas_anuais")
            .select("*")
            .eq("empresa_id", userData.empresa_id)
            .eq("ano", parseInt(anoSelecionado))
            .maybeSingle();

          if (metaData) setMeta(metaData);
          else setMeta({ ano: parseInt(anoSelecionado), meta_faturamento: 0, meta_margem_liquida: 0 });

          // 3. Buscar Obras
          const { data: obrasData } = await supabase
            .from("obras")
            .select("id, nome_obra, faturamento_realizado, lucro_realizado, considerar_na_meta, time_squad")
            .eq("empresa_id", userData.empresa_id)
            .eq("status", "Ativa"); // Opcional: filtrar só ativas

          if (obrasData) setObras(obrasData as any);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userSession, anoSelecionado]);

  // Salvar Meta Geral
  const handleSaveMeta = async () => {
    try {
      const { data: userData } = await supabase.from("usuarios").select("empresa_id").eq("id", userSession.user!.id).single();
      if (!userData?.empresa_id) return;

      const payload = {
        empresa_id: userData.empresa_id,
        ano: parseInt(anoSelecionado),
        meta_faturamento: meta.meta_faturamento,
        meta_margem_liquida: meta.meta_margem_liquida
      };

      const { error } = await supabase
        .from("metas_anuais")
        .upsert(payload, { onConflict: "empresa_id, ano" });

      if (error) throw error;
      toast({ title: "Sucesso", description: "Meta anual atualizada." });
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao salvar meta.", variant: "destructive" });
    }
  };

  // Salvar Obra Individual (ao sair do input)
  const handleUpdateObra = async (id: number, field: string, value: any) => {
    // Atualiza estado local primeiro para UI responsiva
    setObras(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));

    try {
      await supabase.from("obras").update({ [field]: value }).eq("id", id);
    } catch (e) {
      console.error("Erro ao atualizar obra", e);
    }
  };

  // Cálculos Consolidados
  const obrasConsideradas = obras.filter(o => o.considerar_na_meta);
  const totalFaturamento = obrasConsideradas.reduce((acc, curr) => acc + (curr.faturamento_realizado || 0), 0);
  const totalLucro = obrasConsideradas.reduce((acc, curr) => acc + (curr.lucro_realizado || 0), 0);
  const margemAtual = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0;
  const percentualMeta = meta.meta_faturamento > 0 ? (totalFaturamento / meta.meta_faturamento) * 100 : 0;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
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
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Meta Faturamento</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(meta.meta_faturamento)}</div>
            <Input 
              type="number" 
              className="mt-2 h-8 text-xs" 
              placeholder="Definir Meta..." 
              value={meta.meta_faturamento || ''}
              onChange={e => setMeta({...meta, meta_faturamento: parseFloat(e.target.value)})}
              onBlur={handleSaveMeta}
            />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Realizado (Obras Sel.)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(totalFaturamento)}</div>
            <div className="text-xs text-slate-500 mt-1">
              {percentualMeta.toFixed(1)}% da meta atingida
            </div>
            <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${Math.min(percentualMeta, 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Lucro & Margem Real</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalLucro)}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={margemAtual >= meta.meta_margem_liquida ? "secondary" : "destructive"} className="text-xs">
                {margemAtual.toFixed(2)}% Margem
              </Badge>
              <span className="text-xs text-slate-400">Meta: {meta.meta_margem_liquida}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Meta Margem Líquida</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meta.meta_margem_liquida}%</div>
            <Input 
              type="number" 
              className="mt-2 h-8 text-xs" 
              placeholder="Definir %..." 
              value={meta.meta_margem_liquida || ''}
              onChange={e => setMeta({...meta, meta_margem_liquida: parseFloat(e.target.value)})}
              onBlur={handleSaveMeta}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Obras e Squads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Detalhamento por Squad (Obras)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Meta?</TableHead>
                <TableHead>Obra / Squad</TableHead>
                <TableHead>Time (Membros)</TableHead>
                <TableHead className="text-right">Faturamento</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-center">% Contribuição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obras.map((obra) => {
                const contrib = meta.meta_faturamento > 0 ? (obra.faturamento_realizado / meta.meta_faturamento) * 100 : 0;
                
                return (
                  <TableRow key={obra.id} className={!obra.considerar_na_meta ? "opacity-50 bg-slate-50" : ""}>
                    <TableCell>
                      <Switch 
                        checked={obra.considerar_na_meta}
                        onCheckedChange={(checked) => handleUpdateObra(obra.id, 'considerar_na_meta', checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{obra.nome_obra}</TableCell>
                    <TableCell>
                      <Input 
                        className="h-8 text-xs w-full min-w-[200px]" 
                        placeholder="Ex: Ana, João, Pedro..."
                        value={obra.time_squad ? obra.time_squad.join(", ") : ""}
                        onChange={(e) => {
                          const arr = e.target.value.split(",").map(s => s.trim());
                          // A atualização real no banco seria mais complexa para array, 
                          // aqui simplificamos a UX para string comma-separated
                          // Idealmente, use um componente de Tags Input.
                        }}
                        // Simulação de salvar como array simples ao perder foco
                        onBlur={(e) => handleUpdateObra(obra.id, 'time_squad', e.target.value.split(",").map(s => s.trim()))}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-slate-400">R$</span>
                        <Input 
                          type="number"
                          className="h-8 w-[100px] text-right"
                          value={obra.faturamento_realizado}
                          onChange={(e) => handleUpdateObra(obra.id, 'faturamento_realizado', parseFloat(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-slate-400">R$</span>
                        <Input 
                          type="number"
                          className="h-8 w-[100px] text-right"
                          value={obra.lucro_realizado}
                          onChange={(e) => handleUpdateObra(obra.id, 'lucro_realizado', parseFloat(e.target.value))}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-slate-100">
                        {contrib.toFixed(2)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoMetas;
