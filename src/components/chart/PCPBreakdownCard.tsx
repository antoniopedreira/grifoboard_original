
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";

interface PCPBreakdownCardProps {
  title: string;
  data: Record<string, PCPData>;
}

const PCPBreakdownCard: React.FC<PCPBreakdownCardProps> = ({ title, data }) => {
  return (
    <Card className="col-span-1 lg:col-span-1 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data && Object.entries(data).map(([key, value]) => (
            <PCPProgress key={key} data={value} label={key} />
          ))}
          {(!data || Object.keys(data).length === 0) && (
            <div className="text-sm text-muted-foreground">Sem dados disponíveis</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PCPBreakdownCard;
