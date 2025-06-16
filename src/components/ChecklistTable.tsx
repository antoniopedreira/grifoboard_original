
import { Task } from "@/types";
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
  tasks: Task[];
  isLoading: boolean;
  onTaskToggle: (taskId: string, completed: boolean) => void;
}

const ChecklistTable: React.FC<ChecklistTableProps> = ({ 
  tasks, 
  isLoading, 
  onTaskToggle 
}) => {
  const formatWeekDate = (date: Date | undefined) => {
    if (!date) return "Não definida";
    
    try {
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
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

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhuma tarefa encontrada para esta obra
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data da Semana</TableHead>
            <TableHead>Disciplina</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={task.isFullyCompleted}
                  onCheckedChange={(checked) => 
                    onTaskToggle(task.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                {task.description}
              </TableCell>
              <TableCell>{task.sector}</TableCell>
              <TableCell>{task.responsible}</TableCell>
              <TableCell>{formatWeekDate(task.weekStartDate)}</TableCell>
              <TableCell>{task.discipline}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChecklistTable;
