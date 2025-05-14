
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { obrasService } from '@/services/obraService';
import { useToast } from '@/hooks/use-toast';

interface ObraFormProps {
  isOpen: boolean;
  onClose: () => void;
  onObraCriada: () => void;
}

const ObraForm = ({ isOpen, onClose, onObraCriada }: ObraFormProps) => {
  const [nomeObra, setNomeObra] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [status, setStatus] = useState('em_andamento');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setNomeObra('');
    setLocalizacao('');
    setDataInicio('');
    setStatus('em_andamento');
    setIsSubmitting(false);
  };
  
  const isFormValid = () => {
    return nomeObra.trim() !== '' && localizacao.trim() !== '' && dataInicio !== '';
  };

  const handleCreateObra = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
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
      
      onClose();
      resetForm();
      onObraCriada();
    } catch (error: any) {
      console.error("Erro ao criar obra:", error);
      
      toast({
        title: "Erro ao criar obra",
        description: error.message || "Ocorreu um erro ao criar a obra. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
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
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateObra} 
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar Obra'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObraForm;
