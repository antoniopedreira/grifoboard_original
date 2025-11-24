import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlaybookTable from '@/components/playbook/PlaybookTable';
import PlaybookForm from '@/components/playbook/PlaybookForm';
import PlaybookSummary from '@/components/playbook/PlaybookSummary';
import PlaybookDetailsModal from '@/components/playbook/PlaybookDetailsModal';

export interface PlaybookItem {
  id: string;
  obra_id: string;
  etapa: string;
  proposta: string;
  responsavel: string;
  quantidade: number;
  unidade: string;
  orcamento_meta_unitario: number;
  valor_contratado: number | null;
  status: 'Negociadas' | 'Em Andamento' | 'A Negociar';
  observacao: string | null;
}

export default function Playbook() {
  const { userSession } = useAuth();
  const { toast } = useToast();
  const [fornecimentosData, setFornecimentosData] = useState<PlaybookItem[]>([]);
  const [obraData, setObraData] = useState<PlaybookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFornecimentosForm, setShowFornecimentosForm] = useState(false);
  const [showObraForm, setShowObraForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PlaybookItem | null>(null);
  const [editingTable, setEditingTable] = useState<'fornecimentos' | 'obra' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlaybookItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (userSession?.obraAtiva?.id) {
      loadData();
    }
  }, [userSession?.obraAtiva?.id]);

  const loadData = async () => {
    if (!userSession?.obraAtiva?.id) return;

    setIsLoading(true);
    try {
      const [fornecimentosResponse, obraResponse] = await Promise.all([
        supabase
          .from('playbook_fornecimentos')
          .select('*')
          .eq('obra_id', userSession.obraAtiva.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('playbook_obra')
          .select('*')
          .eq('obra_id', userSession.obraAtiva.id)
          .order('created_at', { ascending: true }),
      ]);

      if (fornecimentosResponse.error) throw fornecimentosResponse.error;
      if (obraResponse.error) throw obraResponse.error;

      setFornecimentosData(fornecimentosResponse.data as PlaybookItem[] || []);
      setObraData(obraResponse.data as PlaybookItem[] || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFornecimentos = () => {
    setEditingItem(null);
    setEditingTable('fornecimentos');
    setShowFornecimentosForm(true);
  };

  const handleAddObra = () => {
    setEditingItem(null);
    setEditingTable('obra');
    setShowObraForm(true);
  };

  const handleEdit = (item: PlaybookItem, table: 'fornecimentos' | 'obra') => {
    setSelectedItem(null);
    setDetailsModalOpen(false);
    setEditingItem(item);
    setEditingTable(table);
    if (table === 'fornecimentos') {
      setShowFornecimentosForm(true);
    } else {
      setShowObraForm(true);
    }
  };

  const handleRowClick = (item: PlaybookItem, table: 'fornecimentos' | 'obra') => {
    setSelectedItem(item);
    setEditingTable(table);
    setDetailsModalOpen(true);
  };

  const handleDelete = async (id: string, table: 'fornecimentos' | 'obra') => {
    try {
      const tableName = table === 'fornecimentos' ? 'playbook_fornecimentos' : 'playbook_obra';
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso',
      });

      loadData();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowFornecimentosForm(false);
    setShowObraForm(false);
    setEditingItem(null);
    setEditingTable(null);
    loadData();
  };

  if (!userSession?.obraAtiva) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Selecione uma obra para visualizar o Playbook
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Playbook - {userSession.obraAtiva.nome_obra}</h1>
      </div>

      <Tabs defaultValue="fornecimentos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fornecimentos">Fornecimentos</TabsTrigger>
          <TabsTrigger value="obra">Obra</TabsTrigger>
        </TabsList>

        {/* Farol de Contratação de Fornecimentos */}
        <TabsContent value="fornecimentos" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro - Fornecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaybookSummary data={fornecimentosData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Farol de Contratação de Fornecimentos</CardTitle>
              <Button onClick={handleAddFornecimentos} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <PlaybookTable
                data={fornecimentosData}
                isLoading={isLoading}
                onRowClick={(item) => handleRowClick(item, 'fornecimentos')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farol de Contratação de Obra */}
        <TabsContent value="obra" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro - Obra</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaybookSummary data={obraData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Farol de Contratação de Obra</CardTitle>
              <Button onClick={handleAddObra} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent>
              <PlaybookTable
                data={obraData}
                isLoading={isLoading}
                onRowClick={(item) => handleRowClick(item, 'obra')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialogs */}
      {showFornecimentosForm && (
        <PlaybookForm
          isOpen={showFornecimentosForm}
          onClose={() => {
            setShowFornecimentosForm(false);
            setEditingItem(null);
          }}
          onSuccess={handleFormSuccess}
          obraId={userSession.obraAtiva.id}
          table="fornecimentos"
          editingItem={editingItem}
        />
      )}

      {showObraForm && (
        <PlaybookForm
          isOpen={showObraForm}
          onClose={() => {
            setShowObraForm(false);
            setEditingItem(null);
          }}
          onSuccess={handleFormSuccess}
          obraId={userSession.obraAtiva.id}
          table="obra"
          editingItem={editingItem}
        />
      )}

      {/* Details Modal */}
      <PlaybookDetailsModal
        item={selectedItem}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedItem(null);
        }}
        onEdit={(item) => handleEdit(item, editingTable || 'fornecimentos')}
        onDelete={(id) => handleDelete(id, editingTable || 'fornecimentos')}
      />
    </div>
  );
}
