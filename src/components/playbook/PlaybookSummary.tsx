import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlaybookItem } from '@/pages/Playbook';

interface PlaybookSummaryProps {
  data: PlaybookItem[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export default function PlaybookSummary({ data }: PlaybookSummaryProps) {
  // Calculate totals by status
  const calculateTotals = () => {
    const statusTotals = {
      'Negociadas': { orcado: 0, efetivado: 0 },
      'Em Andamento': { orcado: 0, efetivado: 0 },
      'A Negociar': { orcado: 0, efetivado: 0 },
    };

    data.forEach(item => {
      const orcado = item.orcamento_meta_unitario * item.quantidade;
      const efetivado = item.valor_contratado || 0;
      
      if (statusTotals[item.status]) {
        statusTotals[item.status].orcado += orcado;
        statusTotals[item.status].efetivado += efetivado;
      }
    });

    return statusTotals;
  };

  const totals = calculateTotals();
  
  // Calculate grand totals
  const totalOrcado = Object.values(totals).reduce((sum, item) => sum + item.orcado, 0);
  const totalEfetivado = Object.values(totals).reduce((sum, item) => sum + item.efetivado, 0);
  const totalVerbaDisponivel = totalOrcado - totalEfetivado;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Negociadas':
        return 'text-green-600';
      case 'Em Andamento':
        return 'text-yellow-600';
      case 'A Negociar':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow>
            <TableHead className="text-white font-bold">SITUAÇÃO</TableHead>
            <TableHead className="text-white font-bold text-right">ORÇADO</TableHead>
            <TableHead className="text-white font-bold text-right">%</TableHead>
            <TableHead className="text-white font-bold text-right">EFETIVADO</TableHead>
            <TableHead className="text-white font-bold text-right">%</TableHead>
            <TableHead className="text-white font-bold text-right">VERBA DISPONÍVEL</TableHead>
            <TableHead className="text-white font-bold text-right">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Negociadas */}
          <TableRow>
            <TableCell className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className={getStatusColor('Negociadas')}>NEGOCIADAS</span>
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['Negociadas'].orcado)}</TableCell>
            <TableCell className="text-right">
              {totalOrcado > 0 ? formatPercentage((totals['Negociadas'].orcado / totalOrcado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['Negociadas'].efetivado)}</TableCell>
            <TableCell className="text-right">
              {totalEfetivado > 0 ? formatPercentage((totals['Negociadas'].efetivado / totalEfetivado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">
              R$ {formatCurrency(totals['Negociadas'].orcado - totals['Negociadas'].efetivado)}
            </TableCell>
            <TableCell className="text-right">
              {totals['Negociadas'].orcado > 0 ? formatPercentage((1 - (totals['Negociadas'].efetivado / totals['Negociadas'].orcado)) * 100) : '100,00%'}
            </TableCell>
          </TableRow>

          {/* Em Andamento */}
          <TableRow>
            <TableCell className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className={getStatusColor('Em Andamento')}>EM ANDAMENTO</span>
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['Em Andamento'].orcado)}</TableCell>
            <TableCell className="text-right">
              {totalOrcado > 0 ? formatPercentage((totals['Em Andamento'].orcado / totalOrcado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['Em Andamento'].efetivado)}</TableCell>
            <TableCell className="text-right">
              {totalEfetivado > 0 ? formatPercentage((totals['Em Andamento'].efetivado / totalEfetivado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">
              R$ {formatCurrency(totals['Em Andamento'].orcado - totals['Em Andamento'].efetivado)}
            </TableCell>
            <TableCell className="text-right">
              {totals['Em Andamento'].orcado > 0 ? formatPercentage((1 - (totals['Em Andamento'].efetivado / totals['Em Andamento'].orcado)) * 100) : '100,00%'}
            </TableCell>
          </TableRow>

          {/* A Negociar */}
          <TableRow>
            <TableCell className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className={getStatusColor('A Negociar')}>A NEGOCIAR</span>
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['A Negociar'].orcado)}</TableCell>
            <TableCell className="text-right">
              {totalOrcado > 0 ? formatPercentage((totals['A Negociar'].orcado / totalOrcado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totals['A Negociar'].efetivado)}</TableCell>
            <TableCell className="text-right">
              {totalEfetivado > 0 ? formatPercentage((totals['A Negociar'].efetivado / totalEfetivado) * 100) : '0,00%'}
            </TableCell>
            <TableCell className="text-right">
              R$ {formatCurrency(totals['A Negociar'].orcado - totals['A Negociar'].efetivado)}
            </TableCell>
            <TableCell className="text-right">
              {totals['A Negociar'].orcado > 0 ? formatPercentage((1 - (totals['A Negociar'].efetivado / totals['A Negociar'].orcado)) * 100) : '100,00%'}
            </TableCell>
          </TableRow>

          {/* TOTAL */}
          <TableRow className="bg-slate-100 font-bold">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totalOrcado)}</TableCell>
            <TableCell className="text-right">100,00%</TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totalEfetivado)}</TableCell>
            <TableCell className="text-right">100,00%</TableCell>
            <TableCell className="text-right">R$ {formatCurrency(totalVerbaDisponivel)}</TableCell>
            <TableCell className="text-right">
              {totalOrcado > 0 ? formatPercentage((1 - (totalEfetivado / totalOrcado)) * 100) : '100,00%'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
