
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Obra } from '@/types/supabase';
import { MapPin } from 'lucide-react'; // Fixed import - use camelCase

interface ObraCardProps {
  obra: Obra;
  onSelect: (obra: Obra) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onEdit?: (obra: Obra, e: React.MouseEvent) => void;
}

const ObraCard = ({ obra, onSelect, onDelete, onEdit }: ObraCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-100 bg-white"
      onClick={() => onSelect(obra)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-900">{obra.nome_obra}</CardTitle>
            <CardDescription className="text-gray-500 flex items-center mt-1">
              <MapPin className="mr-1 h-4 w-4" />
              {obra.localizacao}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(obra, e);
                }}
              >
                Editar
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(obra.id, e);
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Início:</span>
            <span>{new Date(obra.data_inicio).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-500">Status:</span>
            <span className="capitalize">
              {obra.status === 'em_andamento' ? 'Em andamento' : 
                obra.status === 'concluida' ? 'Concluída' : 
                obra.status === 'nao_iniciada' ? 'Não iniciada' : obra.status}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full text-gray-700 border-gray-200 hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(obra);
          }}
        >
          Selecionar Obra
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ObraCard;
