
import { Obra } from '@/types/supabase';
import { Building2, Construction, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
          <span className="grifo-body text-muted-foreground">Carregando obras...</span>
        </div>
      </div>
    );
  }

  if (obras.length === 0) {
    return (
      <div className="grifo-surface p-8 text-center rounded-grifo-lg">
        <div className="w-16 h-16 bg-primary/10 rounded-grifo-lg flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <h3 className="grifo-h3 mb-2">Você ainda não tem obras</h3>
        <p className="grifo-body text-muted-foreground">
          Crie a primeira obra para começar a acompanhar o desempenho em tempo real
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {obras.map((obra) => (
        <div 
          key={obra.id} 
          className="grifo-card p-6 cursor-pointer grifo-interactive group"
          onClick={() => onSelectObra(obra)}
        >
          {/* Header do card */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-grifo-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <Badge className="grifo-chip-success">
              Ativa
            </Badge>
          </div>

          {/* Conteúdo */}
          <div className="mb-4">
            <h3 className="grifo-h3 mb-2 group-hover:text-primary transition-colors">
              {obra.nome_obra}
            </h3>
            <div className="flex items-center text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="grifo-small">{obra.localizacao}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="grifo-small text-muted-foreground">
              Início: {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex space-x-2">
              {onEditObra && (
                <button
                  onClick={(e) => onEditObra(obra, e)}
                  className="grifo-small text-primary hover:text-primary-hover transition-colors"
                >
                  Editar
                </button>
              )}
              <button
                onClick={(e) => onDeleteObra(obra.id, e)}
                className="grifo-small text-destructive hover:text-destructive/80 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ObrasList;
