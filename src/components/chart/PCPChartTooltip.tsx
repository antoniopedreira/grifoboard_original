
import React from "react";

const PCPChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-lg rounded-md p-2 border border-gray-200">
      <p className="font-medium text-sm">{label || data.name}</p>
      <p className="text-blue-500 font-bold">{`${Math.round(data.value)}%`}</p>
      {data.isCurrentWeek && <p className="text-xs text-gray-500">Semana Atual</p>}
    </div>
  );
};

export default React.memo(PCPChartTooltip);
