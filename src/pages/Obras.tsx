
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obrasService } from '@/services/obraService';
import { masterAdminService } from '@/services/masterAdminService';
import { Obra } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRegistry } from '@/context/RegistryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ObrasList from '@/components/obra/ObrasList';
import ObraForm from '@/components/obra/ObraForm';
import ObraEditForm from '@/components/obra/ObraEditForm';
import { useToast } from '@/hooks/use-toast';

interface ObrasPageProps {
  onObraSelect: (obra: Obra) => void;
}

const Obras = ({ onObraSelect }: ObrasPageProps) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedObraForEdit, setSelectedObraForEdit] = useState<Obra | null>(null);
  const { userSession, setObraAtiva } = useAuth();
  const { setSelectedObraId } = useRegistry();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Check if user is master_admin and redirect accordingly
  useEffect(() => {
    const checkMasterAdmin = async () => {
      if (userSession?.user && !redirectAttempted) {
        try {
          const isMasterAdmin = await masterAdminService.isMasterAdmin();
          
          if (isMasterAdmin) {
            // Master admin should go to master-admin page
            navigate('/master-admin', { replace: true });
            setRedirectAttempted(true);
            return;
          }
        } catch (error) {
          console.error('Error checking master admin status:', error);
        }
      }
    };

    checkMasterAdmin();
  }, [userSession?.user, navigate, redirectAttempted]);

  // If there's no user, redirect to auth page (only once)
  useEffect(() => {
    if (!userSession?.user && !redirectAttempted) {
      navigate("/auth");
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  // If user already has an active obra, redirect to dashboard
  useEffect(() => {
    if (userSession?.user && userSession.obraAtiva && !redirectAttempted) {
      navigate('/dashboard');
      setRedirectAttempted(true);
    }
  }, [userSession, navigate, redirectAttempted]);

  // Fetch obras when user is authenticated
  useEffect(() => {
    const fetchObras = async () => {
      try {
        const obrasData = await obrasService.listarObras();
        setObras(obrasData);
      } catch (error: any) {
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
      // Set the active obra in the auth context (which will also save to localStorage)
      setObraAtiva(obra);
      
      // Set the selected obra ID for registry context
      setSelectedObraId(obra.id);
      
      // Call the onObraSelect prop
      onObraSelect(obra);
      
      // Navigate to dashboard after obra selection
      navigate("/dashboard");
    } catch (error: any) {
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
      toast({
        title: 'Erro ao excluir obra',
        description: error.message || "Ocorreu um erro ao excluir a obra.",
        variant: "destructive",
      });
    }
  };

  const handleEditObra = (obra: Obra, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedObraForEdit(obra);
    setIsEditFormOpen(true);
  };

  const handleObraCriada = async () => {
    try {
      const obrasData = await obrasService.listarObras();
      setObras(obrasData);
    } catch (error) {
      // Silently handle error - not critical for UX
    }
  };

  const handleObraAtualizada = async () => {
    try {
      const obrasData = await obrasService.listarObras();
      setObras(obrasData);
      
      // If the updated obra is the active one, update it in context
      if (selectedObraForEdit && userSession?.obraAtiva?.id === selectedObraForEdit.id) {
        const updatedObra = obrasData.find(o => o.id === selectedObraForEdit.id);
        if (updatedObra) {
          setObraAtiva(updatedObra);
        }
      }
    } catch (error) {
      // Silently handle error - not critical for UX
    }
  };

  if (!userSession?.user) {
    return null; // Rendering will be handled by the useEffect navigation
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
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
            onEditObra={handleEditObra}
          />
        </CardContent>
      </Card>
      
      <ObraForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onObraCriada={handleObraCriada} 
      />
      
      <ObraEditForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedObraForEdit(null);
        }}
        onObraAtualizada={handleObraAtualizada}
        obra={selectedObraForEdit}
      />
    </div>
  );
};

export default Obras;
