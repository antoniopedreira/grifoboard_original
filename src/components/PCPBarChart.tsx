
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer } from "@/components/ui/chart";

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
    // Use different shades of blue based on completion percentage
    if (percentage >= 80) return "#0EA5E9"; // Deep blue for high completion
    if (percentage >= 60) return "#38BDF8"; // Medium blue
    if (percentage >= 40) return "#7DD3FC"; // Light blue
    return "#BAE6FD"; // Very light blue for low completion
  };

  return (
    <CardContent className="pt-1 px-0">
      <div className="h-[140px] w-full">
        <ChartContainer
          config={{
            value: {
              label: "PCP (%)"
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                width={35}
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
                fillOpacity={0.9}
                isAnimationActive={true}
                animationDuration={600}
                name="PCP"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </CardContent>
  );
};

export default PCPBarChart;
