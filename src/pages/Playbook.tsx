import { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import { PlaybookImporter } from "@/components/playbook/PlaybookImporter";
import { PlaybookTable, PlaybookItem } from "@/components/playbook/PlaybookTable";
import PlaybookSummary from "@/components/playbook/PlaybookSummary";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { playbookService } from "@/services/playbookService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Playbook = () => {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const obraId = userSession?.obraAtiva?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [playbookData, setPlaybookData] = useState<{
    items: PlaybookItem[];
    grandTotalMeta: number;
    grandTotalOriginal: number;
  } | null>(null);

  // Função para carregar dados do banco
  const fetchPlaybook = async () => {
    if (!obraId) {
      setIsLoading(false);
      setPlaybookData(null);
      return;
    }
    setIsLoading(true);
    try {
      const { config, items } = await playbookService.getPlaybook(obraId);

      if (!items || items.length === 0) {
        setPlaybookData(null);
        return;
      }

      // Recalcular as metas no front com base no coeficiente salvo
      const coef = config?.coeficiente_selecionado === '2' 
        ? (config.coeficiente_2 || 1) 
        : (config?.coeficiente_1 || 1);

      let grandTotalMeta = 0;
      let grandTotalOriginal = 0;

      // Primeiro passo: Calcular totais
      const processedItems = items.map(item => {
        const precoUnitarioMeta = (item.preco_unitario || 0) * coef;
        const precoTotalMeta = (item.preco_total || 0) * coef;

        // Soma ao total apenas se NÃO for etapa (para não duplicar)
        if (!item.is_etapa) {
          grandTotalMeta += precoTotalMeta;
          grandTotalOriginal += (item.preco_total || 0);
        }

        return {
          id: item.id, // Supabase ID, pode ser usado como key, mas cuidado com a tipagem no componente filho se esperar number
          descricao: item.descricao,
          unidade: item.unidade,
          qtd: Number(item.qtd),
          precoUnitario: Number(item.preco_unitario),
          precoTotal: Number(item.preco_total),
          isEtapa: item.is_etapa,
          precoUnitarioMeta,
          precoTotalMeta,
          porcentagem: 0 
        };
      });

      // Segundo passo: Calcular % individual
      const finalItems = processedItems.map(item => ({
        ...item,
        // Conversão de ID UUID string para number é impossível diretamente se o componente espera number.
        // Vamos ajustar o componente Table para aceitar string ou usar o índice 'ordem' se disponível
        // Hack rápido: vamos usar item.ordem se o ID for UUID
        id: (item as any).ordem || Math.random(), 
        porcentagem: grandTotalMeta > 0 && !item.isEtapa
          ? (item.precoTotalMeta / grandTotalMeta) * 100
          : 0
      }));

      setPlaybookData({
        items: finalItems,
        grandTotalMeta,
        grandTotalOriginal
      });

    } catch (error) {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao carregar dados do playbook.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaybook();
  }, [obraId]);

  // Função para limpar dados
  const handleClearData = async () => {
    if (!obraId) return;
    try {
      // Salva uma lista vazia para limpar
      await playbookService.savePlaybook(obraId, { 
        obra_id: obraId, coeficiente_1: 0, coeficiente_2: 0, coeficiente_selecionado: '1' 
      }, []);
      
      setPlaybookData(null);
      toast({ title: "Dados limpos", description: "O orçamento foi removido com sucesso." });
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível limpar os dados.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 py-6 min-h-screen pb-24 space-y-8 bg-slate-50/30">
      
      <MainHeader onNewTaskClick={() => {}} onRegistryClick={() => {}} onChecklistClick={() => {}} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            Playbook de Obras
          </h1>
          <p className="text-slate-500 mt-1 ml-1 text-sm max-w-2xl">
            Controle orçamentário detalhado: Orçamento Original vs. Meta Grifo.
          </p>
        </div>

        <div className="flex items-center gap-2">
           {playbookData && (
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                   <Trash2 className="h-4 w-4 mr-2" /> Limpar
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                 <AlertDialogHeader>
                   <AlertDialogTitle>Excluir Playbook?</AlertDialogTitle>
                   <AlertDialogDescription>
                     Esta ação apagará todos os dados orçamentários importados para esta obra.
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel>Cancelar</AlertDialogCancel>
                   <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">Confirmar Exclusão</AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
           )}
           
           <PlaybookImporter onSave={fetchPlaybook} />
        </div>
      </div>

      {!obraId ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-white/50 min-h-[400px]">
          <CardContent className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
            <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
              <BookOpen className="h-10 w-10 text-slate-300" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-semibold text-slate-700">Selecione uma obra</h3>
              <p className="text-sm text-slate-500">
                Para visualizar o Playbook, selecione uma obra no menu lateral.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-slate-500">Carregando orçamento...</p>
        </div>
      ) : !playbookData ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-white/50 min-h-[400px]">
            <CardContent className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-semibold text-slate-700">Seu Playbook está vazio</h3>
                    <p className="text-sm text-slate-500">
                      Importe sua planilha de orçamento padrão para começar a definir as metas.
                    </p>
                </div>
                <div className="pt-2">
                   {/* Botão de atalho para importar */}
                   <PlaybookImporter onSave={fetchPlaybook} />
                </div>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* 1. KPIs */}
          <PlaybookSummary 
            totalOriginal={playbookData.grandTotalOriginal} 
            totalMeta={playbookData.grandTotalMeta} 
          />
          
          {/* 2. Tabela Detalhada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-slate-700">Estrutura Analítica</h3>
              <span className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                {playbookData.items.length} registros
              </span>
            </div>
            <PlaybookTable 
              data={playbookData.items} 
              grandTotalOriginal={playbookData.grandTotalOriginal}
              grandTotalMeta={playbookData.grandTotalMeta}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Playbook;
