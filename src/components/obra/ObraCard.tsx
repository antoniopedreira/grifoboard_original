
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Obra } from '@/types/supabase';

interface ObraCardProps {
  obra: Obra;
  onSelect: (obra: Obra) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const ObraCard = ({ obra, onSelect, onDelete }: ObraCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(obra)}
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
            onClick={(e) => onDelete(obra.id, e)}
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
