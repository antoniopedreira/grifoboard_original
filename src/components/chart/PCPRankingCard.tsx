
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PCPBreakdown, PCPData } from "@/types";
import { useMemo } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PCPChartTooltip from "./PCPChartTooltip";

interface PCPRankingCardProps {
  title: string;
  dataKey: "byResponsible" | "byTeam" | "byExecutor" | "byCable" | "byDiscipline" | "bySector";
  pcpData: PCPBreakdown;
}

const PCPRankingCard: React.FC<PCPRankingCardProps> = ({ title, dataKey, pcpData }) => {
  // For team, executor, and cable we need to transform the tasks to get the data
  const rankingData = useMemo(() => {
    // Handle the standard cases from pcpData
    if (dataKey === "byResponsible" || dataKey === "byDiscipline" || dataKey === "bySector") {
      const rawData = pcpData[dataKey] || {};
      
      // Convert to array and sort
      return Object.entries(rawData)
        .map(([name, data]) => ({
          name,
          value: Math.round(data.percentage),
          completedTasks: data.completedTasks,
          totalTasks: data.totalTasks,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10
    }
    
    // Return empty array for now - we'll add specialized transformation for other keys later
    return [];
  }, [pcpData, dataKey]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rankingData.length > 0 ? (
          <div className="h-64">
            <ChartContainer
              config={{
                value: {
                  label: "PCP (%)"
                }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={rankingData}
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    width={50}
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                  />
                  <Tooltip content={<PCPChartTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="#38BDF8"
                    radius={[0, 4, 4, 0]}
                    name="PCP"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Sem dados disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PCPRankingCard;
