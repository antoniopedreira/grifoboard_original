
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PCPBreakdownCardProps {
  title: string;
  data: Record<string, PCPData>;
}

const PCPBreakdownCard: React.FC<PCPBreakdownCardProps> = ({ title, data }) => {
  // Sort data entries by percentage in descending order
  const sortedEntries = data 
    ? Object.entries(data).sort((a, b) => b[1].percentage - a[1].percentage)
    : [];

  return (
    <>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">{title}</CardTitle>
        </CardHeader>
      )}
      <div>
        <ScrollArea className="h-[180px] pr-4">
          <div className="space-y-3">
            {sortedEntries.length > 0 && sortedEntries.map(([key, value]) => (
              <PCPProgress key={key} data={value} label={key} />
            ))}
            {(!data || Object.keys(data).length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-6">Sem dados disponíveis</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default PCPBreakdownCard;
