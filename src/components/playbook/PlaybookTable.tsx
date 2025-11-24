import { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { capitalizeWords } from '@/lib/utils/textUtils';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

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
            const diferenca = orcamentoMetaTotal - (item.valor_contratado || 0);

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{capitalizeWords(item.etapa)}</TableCell>
                <TableCell>{capitalizeWords(item.proposta)}</TableCell>
                <TableCell>{capitalizeWords(item.responsavel)}</TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell>{capitalizeWords(item.unidade)}</TableCell>
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
                    item.valor_contratado
                      ? diferenca >= 0
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
                        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
                      : ''
                  }`}
                >
                  {item.valor_contratado ? formatCurrency(diferenca) : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {capitalizeWords(item.observacao) || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(item.id)}
                      title="Excluir"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
