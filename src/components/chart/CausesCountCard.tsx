
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Task } from "@/types";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface CausesCountCardProps {
  tasks: Task[];
  onCauseSelect: (cause: string) => void;
}

const CausesCountCard: React.FC<CausesCountCardProps> = ({ tasks, onCauseSelect }) => {
  // Count occurrences of each cause
  const causeCount: Record<string, number> = {};
  
  tasks.forEach(task => {
    if (task.causeIfNotDone) {
      causeCount[task.causeIfNotDone] = (causeCount[task.causeIfNotDone] || 0) + 1;
    }
  });

  // Convert to array for sorting
  const causesArray = Object.entries(causeCount).map(([cause, count]) => ({
    cause,
    count
  }));

  // Sort by count (highest to lowest)
  causesArray.sort((a, b) => b.count - a.count);

  if (causesArray.length === 0) {
    return (
      <Card className="col-span-1 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Causas do Não Cumprimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-6">
            Nenhuma causa registrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">Causas do Não Cumprimento</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="max-h-[220px] overflow-y-auto">
          <Table>
            <TableBody>
              {causesArray.map(({ cause, count }) => (
                <TableRow 
                  key={cause}
                  className="cursor-pointer hover:bg-muted/80"
                  onClick={() => onCauseSelect(cause)}
                >
                  <TableCell className="py-2">{cause}</TableCell>
                  <TableCell className="py-2 text-right font-medium">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CausesCountCard;
