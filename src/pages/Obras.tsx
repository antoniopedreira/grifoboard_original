
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { obrasService } from '@/services/obraService';
import { Obra } from '@/types/supabase';
import Header from '@/components/Header';
import ObrasList from '@/components/obra/ObrasList';
import ObraForm from '@/components/obra/ObraForm';

const Obras = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Minhas Obras</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Nova Obra</Button>
        </div>
        
        <ObrasList 
          obras={obras} 
          isLoading={isLoading} 
          onSelectObra={handleSelectObra} 
          onDeleteObra={handleDeleteObra}
        />
        
        <ObraForm 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          onObraCriada={loadObras}
        />
      </main>
    </div>
  );
};

export default Obras;
