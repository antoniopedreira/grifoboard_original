
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obrasService } from '@/services/obraService';
import { Obra } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRegistry } from '@/context/RegistryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ObrasList from '@/components/obra/ObrasList';
import ObraForm from '@/components/obra/ObraForm';
import { useToast } from '@/hooks/use-toast';

interface ObrasPageProps {
  onObraSelect: (obra: Obra) => void;
}

const Obras = ({ onObraSelect }: ObrasPageProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { userSession, setObraAtiva } = useAuth();
  const { setSelectedObraId } = useRegistry();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If there's no user, redirect to auth page
  useEffect(() => {
    if (!userSession?.user) {
      navigate("/auth");
    }
  }, [userSession, navigate]);

  // Fetch obras
  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await obrasService.listarObras();
        setObras(obrasData);
      } catch (error: any) {
        console.error('Error fetching obras:', error);
        toast({
          title: 'Erro ao buscar obras',
          description: error.message || "Ocorreu um erro ao buscar as obras.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userSession?.user) {
      fetchObras();
    }
  }, [userSession?.user, toast]);

  const handleSelectObra = async (obra: Obra) => {
    try {
      setObraAtiva(obra);
      
      // Set the selected obra ID for registry context
      setSelectedObraId(obra.id);
      
      // Call the onObraSelect prop
      onObraSelect(obra);
      
      navigate("/");
    } catch (error: any) {
      console.error('Error selecting obra:', error);
      toast({
        title: 'Erro ao selecionar obra',
        description: error.message || "Ocorreu um erro ao selecionar a obra.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteObra = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await obrasService.excluirObra(id);
      
      setObras(prevObras => prevObras.filter(obra => obra.id !== id));
      
      // If the active obra was deleted, clear it
      if (userSession?.obraAtiva?.id === id) {
        setObraAtiva(null);
        
        // Clear selected obra ID
        setSelectedObraId(null);
      }
      
      toast({
        title: 'Obra excluída',
        description: "A obra foi excluída com sucesso!",
      });
    } catch (error: any) {
      console.error('Error deleting obra:', error);
      toast({
        title: 'Erro ao excluir obra',
        description: error.message || "Ocorreu um erro ao excluir a obra.",
        variant: "destructive",
      });
    }
  };

  const handleObraCriada = async () => {
    try {
      const obrasData = await obrasService.listarObras();
      setObras(obrasData);
    } catch (error) {
      console.error('Error refreshing obras list:', error);
    }
  };

  if (!userSession?.user) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  return (
    <div className="flex-1 container max-w-7xl py-4 bg-background">
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-gray-900">Minhas Obras</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Obra
          </Button>
        </CardHeader>
        
        <CardContent>
          <ObrasList 
            obras={obras} 
            isLoading={isLoading} 
            onSelectObra={handleSelectObra}
            onDeleteObra={handleDeleteObra}
          />
        </CardContent>
      </Card>
      
      <ObraForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onObraCriada={handleObraCriada} 
      />
    </div>
  );
};

export default Obras;
