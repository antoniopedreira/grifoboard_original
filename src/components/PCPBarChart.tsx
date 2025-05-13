
import React from "react";
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
  const chartData = weeklyData.map(item => ({
    name: format(item.date, "dd/MM", { locale: ptBR }),
    value: item.percentage,
    isCurrentWeek: item.isCurrentWeek
  }));

  // Chart colors
  const chartColors = {
    standard: "#38BDF8",   // Standard blue color for all bars
    highlighted: "#0EA5E9" // Highlighted color for current week
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
