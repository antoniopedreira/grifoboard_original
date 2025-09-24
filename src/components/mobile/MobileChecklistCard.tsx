import { AtividadeChecklist } from "@/types/checklist";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, ChevronDown, MapPin, Building, User, Calendar } from "lucide-react";
import { useState } from "react";

interface MobileChecklistCardProps {
  atividade: AtividadeChecklist;
  onAtividadeToggle: (atividadeId: string, concluida: boolean) => void;
  onAtividadeDelete: (atividadeId: string) => void;
}

const MobileChecklistCard: React.FC<MobileChecklistCardProps> = ({ 
  atividade, 
  onAtividadeToggle,
  onAtividadeDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não definida";
    
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };

  return (
    <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-100/60">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={atividade.concluida}
            onCheckedChange={(checked) => 
              onAtividadeToggle(atividade.id, checked as boolean)
            }
            className="mt-1 min-w-[20px] min-h-[20px]"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground line-clamp-2 text-sm">
              {atividade.descricao || "Atividade sem descrição"}
            </h3>
            
            {/* Key info visible by default */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {atividade.local}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Building className="w-3 h-3 mr-1" />
                {atividade.setor}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir atividade</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onAtividadeDelete(atividade.id)}
                    className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">Responsável:</span>
                <span>{atividade.responsavel}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Início:</span>
                  <span>{formatDate(atividade.data_inicio)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Término:</span>
                  <span>{formatDate(atividade.data_termino)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default MobileChecklistCard;