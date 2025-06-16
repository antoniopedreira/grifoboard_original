
import { AtividadeChecklist } from "@/types/checklist";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChecklistTableProps {
  atividades: AtividadeChecklist[];
  isLoading: boolean;
  onAtividadeToggle: (atividadeId: string, concluida: boolean) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({ 
  atividades, 
  isLoading, 
  onAtividadeToggle 
}) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não definida";
    
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (atividades.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhuma atividade cadastrada para esta obra
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data de Início</TableHead>
            <TableHead>Data de Término</TableHead>
            <TableHead>Descrição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {atividades.map((atividade) => (
            <TableRow key={atividade.id}>
              <TableCell>
                <Checkbox
                  checked={atividade.concluida}
                  onCheckedChange={(checked) => 
                    onAtividadeToggle(atividade.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                {atividade.local}
              </TableCell>
              <TableCell>{atividade.setor}</TableCell>
              <TableCell>{atividade.responsavel}</TableCell>
              <TableCell>{formatDate(atividade.data_inicio)}</TableCell>
              <TableCell>{formatDate(atividade.data_termino)}</TableCell>
              <TableCell>{atividade.descricao || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChecklistTable;
