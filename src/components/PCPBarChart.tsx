
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChartContainer } from "@/components/ui/chart";
import PCPChartTooltip from "./chart/PCPChartTooltip";
import PCPChartBars from "./chart/PCPChartBars";

interface PCPBarChartProps {
  weeklyData: {
    week: string;
    percentage: number;
    date: Date;
    isCurrentWeek?: boolean;
  }[];
}

const PCPBarChart: React.FC<PCPBarChartProps> = ({ weeklyData }) => {
  // Create data array for the chart with formatted dates
  const chartData = weeklyData.map(item => ({
    name: format(item.date, "dd/MM", { locale: ptBR }),
    value: item.percentage,
    isCurrentWeek: item.isCurrentWeek
  }));

  // Chart colors - all set to the same blue color
  const chartColors = {
    standard: "#021C2F",
    highlighted: "#021C2F"
  };

  return (
    <CardContent className="pt-1 px-0">
      <div className="h-[220px] w-full">
        <ChartContainer
          config={{
            value: {
              label: "PCP (%)"
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 30, right: 10, left: 0, bottom: 5 }}
              barSize={36} // Aumentado a largura das barras
              barGap={2}   // Gap between bars
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickCount={5}
                width={35}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<PCPChartTooltip />} />
              <PCPChartBars chartData={chartData} colors={chartColors} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </CardContent>
  );
};

export default PCPBarChart;
