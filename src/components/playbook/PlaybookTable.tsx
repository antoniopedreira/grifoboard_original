import { PlaybookItem } from '@/pages/Playbook';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { capitalizeWords } from '@/lib/utils/textUtils';

interface PlaybookTableProps {
  data: PlaybookItem[];
  isLoading: boolean;
  onRowClick: (item: PlaybookItem) => void;
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
  onRowClick,
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
            <TableHead className="min-w-[120px] text-xs">Etapa</TableHead>
            <TableHead className="min-w-[150px] text-xs">Proposta</TableHead>
            <TableHead className="min-w-[120px] text-xs">Responsável</TableHead>
            <TableHead className="text-right min-w-[80px] text-xs">Qtd</TableHead>
            <TableHead className="min-w-[80px] text-xs">Unidade</TableHead>
            <TableHead className="text-right min-w-[120px] text-xs">Orç. Meta Unit.</TableHead>
            <TableHead className="text-right min-w-[120px] text-xs">Orç. Meta Total</TableHead>
            <TableHead className="text-right min-w-[120px] text-xs">Valor Contratado</TableHead>
            <TableHead className="min-w-[110px] text-xs">Status</TableHead>
            <TableHead className="text-right min-w-[110px] text-xs">Diferença</TableHead>
            <TableHead className="min-w-[120px] text-xs">Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const orcamentoMetaTotal = item.quantidade * item.orcamento_meta_unitario;
            const diferenca = orcamentoMetaTotal - (item.valor_contratado || 0);

            return (
              <TableRow 
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onRowClick(item)}
              >
                <TableCell className="font-medium text-xs">{capitalizeWords(item.etapa)}</TableCell>
                <TableCell className="text-xs">{capitalizeWords(item.proposta)}</TableCell>
                <TableCell className="text-xs">{capitalizeWords(item.responsavel)}</TableCell>
                <TableCell className="text-right text-xs">{item.quantidade}</TableCell>
                <TableCell className="text-xs">{capitalizeWords(item.unidade)}</TableCell>
                <TableCell className="text-right text-xs whitespace-nowrap">
                  {formatCurrency(item.orcamento_meta_unitario)}
                </TableCell>
                <TableCell className="text-right bg-yellow-50 dark:bg-yellow-950 text-xs whitespace-nowrap">
                  {formatCurrency(orcamentoMetaTotal)}
                </TableCell>
                <TableCell className="text-right text-xs whitespace-nowrap">
                  {formatCurrency(item.valor_contratado)}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge className={getStatusColor(item.status)} variant="outline">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold text-xs whitespace-nowrap ${
                    item.valor_contratado
                      ? diferenca >= 0
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
                        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
                      : ''
                  }`}
                >
                  {item.valor_contratado ? formatCurrency(diferenca) : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs">
                  {capitalizeWords(item.observacao) || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
