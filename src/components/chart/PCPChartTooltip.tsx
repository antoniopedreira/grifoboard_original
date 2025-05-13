
import React from "react";

interface PCPChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
    };
  }>;
}

const PCPChartTooltip: React.FC<PCPChartTooltipProps> = ({ active, payload }) => {
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
};

export default PCPChartTooltip;
