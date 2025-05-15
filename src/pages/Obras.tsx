
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ObrasList from "@/components/obra/ObrasList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import ObraForm from "@/components/obra/ObraForm";
import { obrasService } from "@/services/obraService"; 
import { useAuth } from "@/context/AuthContext";
import { Obra } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

interface ObrasProps {
  onObraSelect: (obra: Obra) => void;
}

const Obras: React.FC<ObrasProps> = ({ onObraSelect }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setObraAtiva, userSession } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load obras on component mount
  useEffect(() => {
    fetchObras();
  }, []);

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!userSession.user) {
      navigate("/auth");
    }
  }, [userSession.user, navigate]);

  const fetchObras = async () => {
    setIsLoading(true);
    try {
      const obras = await obrasService.listarObras();
      setObras(obras);
    } catch (error: any) {
      console.error("Error fetching obras:", error);
      toast({
        title: "Erro ao carregar obras",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleObraSelect = async (obra: Obra) => {
    try {
      await setObraAtiva(obra);
      onObraSelect(obra);
      // Redirect to dashboard 
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao selecionar obra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleObraCreate = async (formData: Omit<Obra, "id" | "created_at" | "usuario_id">) => {
    try {
      await obrasService.criarObra(formData);
      setIsFormOpen(false);
      fetchObras();
      toast({
        title: "Obra criada",
        description: "A obra foi criada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar obra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Obras</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Obra
        </Button>
      </div>

      <ObrasList 
        obras={obras} 
        isLoading={isLoading} 
        onSelectObra={handleObraSelect} 
        onDeleteObra={async (id) => {
          try {
            await obrasService.excluirObra(id);
            fetchObras();
            toast({
              title: "Obra excluída",
              description: "A obra foi excluída com sucesso.",
            });
          } catch (error: any) {
            toast({
              title: "Erro ao excluir obra",
              description: error.message,
              variant: "destructive",
            });
          }
        }}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Obra</DialogTitle>
          </DialogHeader>
          <ObraForm 
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onObraCriada={fetchObras}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Obras;
