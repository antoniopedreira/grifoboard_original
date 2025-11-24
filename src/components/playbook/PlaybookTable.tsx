import { PlaybookItem } from '@/pages/Playbook';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

interface PlaybookTableProps {
  data: PlaybookItem[];
  isLoading: boolean;
  onEdit: (item: PlaybookItem) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Negociadas':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Em Andamento':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'A Negociar':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function PlaybookTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: PlaybookTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando dados...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item cadastrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Etapa</TableHead>
            <TableHead className="min-w-[150px]">Proposta</TableHead>
            <TableHead className="min-w-[120px]">Responsável</TableHead>
            <TableHead className="text-right min-w-[100px]">Qtd</TableHead>
            <TableHead className="min-w-[80px]">Unidade</TableHead>
            <TableHead className="text-right min-w-[140px]">Orç. Meta Unit.</TableHead>
            <TableHead className="text-right min-w-[140px]">Orç. Meta Total</TableHead>
            <TableHead className="text-right min-w-[140px]">Valor Contratado</TableHead>
            <TableHead className="min-w-[130px]">Status</TableHead>
            <TableHead className="text-right min-w-[120px]">Diferença</TableHead>
            <TableHead className="min-w-[150px]">Observação</TableHead>
            <TableHead className="text-right min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const orcamentoMetaTotal = item.quantidade * item.orcamento_meta_unitario;
            const diferenca = (item.valor_contratado || 0) - orcamentoMetaTotal;
            const diferencaPositiva = diferenca >= 0;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.etapa}</TableCell>
                <TableCell>{item.proposta}</TableCell>
                <TableCell>{item.responsavel}</TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell>{item.unidade}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.orcamento_meta_unitario)}
                </TableCell>
                <TableCell className="text-right bg-yellow-50 dark:bg-yellow-950">
                  {formatCurrency(orcamentoMetaTotal)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.valor_contratado)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)} variant="outline">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${
                    diferencaPositiva
                      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
                      : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
                  }`}
                >
                  {formatCurrency(diferenca)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {item.observacao || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
