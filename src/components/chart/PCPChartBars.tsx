
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
          fill={entry.isCurrentWeek ? "#927535" : "#081C2C"} 
          stroke={entry.isCurrentWeek ? "#927535" : ""}
          strokeWidth={entry.isCurrentWeek ? 1 : 0}
        />
      ))}
    </Bar>
  );
};

export default PCPChartBars;
