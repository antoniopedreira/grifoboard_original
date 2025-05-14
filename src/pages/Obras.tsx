
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { obrasService } from '@/services/obraService';
import { Obra } from '@/types/supabase';
import Header from '@/components/Header';

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nomeObra, setNomeObra] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [status, setStatus] = useState('em_andamento');
  
  const { toast } = useToast();
  const { session, setObraAtiva } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.user) {
      navigate('/auth');
      return;
    }
    
    loadObras();
  }, [session.user, navigate]);
  
  const loadObras = async () => {
    try {
      const data = await obrasService.listarObras();
      setObras(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar obras",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateObra = async () => {
    try {
      const novaObra = {
        nome_obra: nomeObra,
        localizacao,
        data_inicio: dataInicio,
        status
      };
      
      await obrasService.criarObra(novaObra);
      
      toast({
        title: "Obra criada",
        description: "A obra foi criada com sucesso!",
      });
      
      setIsDialogOpen(false);
      resetForm();
      loadObras();
    } catch (error: any) {
      toast({
        title: "Erro ao criar obra",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleSelectObra = (obra: Obra) => {
    setObraAtiva(obra);
    navigate('/');
  };
  
  const handleDeleteObra = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await obrasService.excluirObra(id);
      setObras(obras.filter(obra => obra.id !== id));
      
      toast({
        title: "Obra excluída",
        description: "A obra foi excluída com sucesso!",
      });
      
      // Se a obra excluída for a obra ativa, desativa
      if (session.obraAtiva?.id === id) {
        setObraAtiva(null);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao excluir obra",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const resetForm = () => {
    setNomeObra('');
    setLocalizacao('');
    setDataInicio('');
    setStatus('em_andamento');
  };
  
  const isFormValid = () => {
    return nomeObra.trim() !== '' && localizacao.trim() !== '' && dataInicio !== '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Minhas Obras</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Nova Obra</Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Carregando...</p>
          </div>
        ) : obras.length === 0 ? (
          <Card className="text-center p-8">
            <p className="text-muted-foreground">Nenhuma obra encontrada. Crie uma nova obra para começar!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {obras.map((obra) => (
              <Card 
                key={obra.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSelectObra(obra)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{obra.nome_obra}</CardTitle>
                      <CardDescription>{obra.localizacao}</CardDescription>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => handleDeleteObra(obra.id, e)}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Início:</span>
                      <span>{new Date(obra.data_inicio).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">
                        {obra.status === 'em_andamento' ? 'Em andamento' : 
                         obra.status === 'concluida' ? 'Concluída' : 
                         obra.status === 'paralisada' ? 'Paralisada' : obra.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectObra(obra);
                    }}
                  >
                    Selecionar Obra
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Dialog para criar nova obra */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Obra</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome_obra">Nome da Obra</Label>
                <Input
                  id="nome_obra"
                  value={nomeObra}
                  onChange={(e) => setNomeObra(e.target.value)}
                  placeholder="Nome da obra"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Localização da obra"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="paralisada">Paralisada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleCreateObra} disabled={!isFormValid()}>
                Criar Obra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Obras;
