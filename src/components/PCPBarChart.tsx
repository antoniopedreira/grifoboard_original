
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
    isCurrentWeek?: boolean;
  }[];
}

const PCPBarChart: React.FC<PCPBarChartProps> = ({ weeklyData }) => {
  const chartData = weeklyData.map(item => ({
    name: format(item.date, "dd/MM", { locale: ptBR }),
    value: item.percentage,
    isCurrentWeek: item.isCurrentWeek
  }));

  // Standard blue color for all bars
  const standardBarColor = "#38BDF8";
  // Highlighted color for current week
  const highlightedBarColor = "#0EA5E9";

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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isCurrentWeek ? highlightedBarColor : standardBarColor} 
                    stroke={entry.isCurrentWeek ? "#0284C7" : ""}
                    strokeWidth={entry.isCurrentWeek ? 1 : 0}
                  />
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
