
import { Obra } from '@/types/supabase';
import ObraCard from './ObraCard';
import { Card } from '@/components/ui/card';

interface ObrasListProps {
  obras: Obra[];
  isLoading: boolean;
  onSelectObra: (obra: Obra) => void;
  onDeleteObra: (id: string, e: React.MouseEvent) => void;
  onEditObra?: (obra: Obra, e: React.MouseEvent) => void;
}

const ObrasList = ({ obras, isLoading, onSelectObra, onDeleteObra, onEditObra }: ObrasListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-gray-500">
        <p>Carregando...</p>
      </div>
    );
  }

  if (obras.length === 0) {
    return (
      <Card className="text-center p-8 bg-white border border-gray-100">
        <p className="text-gray-500">Nenhuma obra encontrada. Crie uma nova obra para começar!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {obras.map((obra) => (
        <div key={obra.id} className="h-full">
          <ObraCard 
            obra={obra} 
            onSelect={onSelectObra} 
            onDelete={onDeleteObra}
            onEdit={onEditObra}
          />
        </div>
      ))}
    </div>
  );
};

export default ObrasList;
