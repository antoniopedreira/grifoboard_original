
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPData } from "@/types";
import PCPProgress from "./PCPProgress";

interface PCPBreakdownCardProps {
  title: string;
  data: Record<string, PCPData>;
}

const PCPBreakdownCard: React.FC<PCPBreakdownCardProps> = ({ title, data }) => {
  const getCardHighlightClass = (data: Record<string, PCPData>): string => {
    if (!data || Object.keys(data).length === 0) return "";
    
    const percentages = Object.values(data).map(item => item.percentage);
    const avgPercentage = percentages.reduce((sum, val) => sum + val, 0) / percentages.length;
    
    if (avgPercentage >= 80) return "card-highlight card-highlight-good";
    if (avgPercentage >= 60) return "card-highlight card-highlight-medium";
    return "card-highlight card-highlight-bad";
  };

  return (
    <Card className={`col-span-1 lg:col-span-1 shadow-sm bg-[#E0E2EC] ${getCardHighlightClass(data)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-[#081C2C]">{title}</CardTitle>
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
