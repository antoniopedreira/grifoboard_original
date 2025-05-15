
import React from "react";
import { Bar, Cell } from "recharts";

interface PCPChartBarsProps {
  chartData: {
    name: string;
    value: number;
    isCurrentWeek?: boolean;
  }[];
  colors: {
    standard: string;
    highlighted: string;
  };
}

const PCPChartBars: React.FC<PCPChartBarsProps> = ({ chartData, colors }) => {
  return (
    <Bar 
      dataKey="value" 
      radius={[4, 4, 0, 0]} 
      fillOpacity={1}
      isAnimationActive={false}
      name="PCP"
      minPointSize={5} // Garantir que valores pequenos sejam visíveis
    >
      {chartData.map((entry, index) => (
        <Cell 
          key={`cell-${index}`} 
          fill={entry.isCurrentWeek ? colors.highlighted : colors.standard} 
          stroke={entry.isCurrentWeek ? "#0284C7" : ""}
          strokeWidth={entry.isCurrentWeek ? 1 : 0}
        />
      ))}
    </Bar>
  );
};

export default PCPChartBars;
