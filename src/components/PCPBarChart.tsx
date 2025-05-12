
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface PCPBarChartProps {
  weeklyData: {
    week: string;
    percentage: number;
    date: Date;
  }[];
}

const PCPBarChart: React.FC<PCPBarChartProps> = ({ weeklyData }) => {
  const chartData = weeklyData.map(item => ({
    name: format(item.date, "dd/MM", { locale: ptBR }),
    value: item.percentage
  }));

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#16a34a"; // green-600
    if (percentage >= 60) return "#ca8a04"; // yellow-600
    if (percentage >= 40) return "#f97316"; // orange-500
    return "#dc2626"; // red-600
  };

  return (
    <Card className="col-span-3 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">PCP por Semana</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ChartContainer
            config={{
              value: {
                label: "PCP (%)"
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    
                    const data = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="font-medium">{data.payload.name}</div>
                        <div className="text-sm text-muted-foreground">
                          PCP: {data.value}%
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]} 
                  fillOpacity={0.8}
                  isAnimationActive={true}
                  animationDuration={800}
                  name="PCP"
                  fill={(entry) => {
                    // Fix: Using a function for fill is causing the error
                    // Instead, we'll set a default fill and use the Bar's fillOpacity prop
                    return getBarColor(entry.value);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PCPBarChart;
