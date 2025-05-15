
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
  // Create data array for the chart with formatted dates
  const chartData = weeklyData.map(item => ({
    name: format(item.date, "dd/MM", { locale: ptBR }),
    value: item.percentage,
    isCurrentWeek: item.isCurrentWeek
  }));

  // Chart colors
  const chartColors = {
    standard: "#9e804e",   // Standard gold color for all bars
    highlighted: "#876328" // Highlighted color for current week
  };

  return (
    <CardContent className="pt-1 px-0">
      <div className="h-[220px] w-full">
        <ChartContainer
          config={{
            value: {
              label: "PCP (%)",
              theme: {
                light: "#9e804e",
                dark: "#876328"
              }
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              barSize={36} // Aumentado a largura das barras
              barGap={4}   // Gap between bars
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                stroke="currentColor"
                opacity={0.7}
              />
              <YAxis
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                tickCount={5}
                width={35}
                axisLine={false}
                tickLine={false}
                stroke="currentColor"
                opacity={0.7}
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
