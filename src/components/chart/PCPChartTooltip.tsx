
import React from "react";
import { TooltipProps } from "recharts";

// Using the recharts TooltipProps type to ensure compatibility
type PCPChartTooltipProps = TooltipProps<number, string>;

const PCPChartTooltip: React.FC<PCPChartTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0];
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="font-medium mb-1">{data.payload.name}</div>
      <div className="text-sm text-muted-foreground">
        PCP: <span className="font-semibold">{data.value}%</span>
      </div>
      {data.payload.isCurrentWeek && (
        <div className="text-xs text-primary mt-1">
          Semana atual
        </div>
      )}
    </div>
  );
};

export default PCPChartTooltip;
