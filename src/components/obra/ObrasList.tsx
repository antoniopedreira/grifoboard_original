
import { Obra } from '@/types/supabase';
import ObraCard from './ObraCard';
import { Card } from '@/components/ui/card';

interface ObrasListProps {
  obras: Obra[];
  isLoading: boolean;
  onSelectObra: (obra: Obra) => void;
  onDeleteObra: (id: string, e: React.MouseEvent) => void;
}

const ObrasList = ({ obras, isLoading, onSelectObra, onDeleteObra }: ObrasListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  if (obras.length === 0) {
    return (
      <Card className="text-center p-8">
        <p className="text-muted-foreground">Nenhuma obra encontrada. Crie uma nova obra para começar!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {obras.map((obra) => (
        <ObraCard 
          key={obra.id} 
          obra={obra} 
          onSelect={onSelectObra} 
          onDelete={onDeleteObra}
        />
      ))}
    </div>
  );
};

export default ObrasList;
