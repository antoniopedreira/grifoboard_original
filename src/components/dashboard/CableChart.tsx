import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BarChart2 } from "lucide-react";

interface CableChartProps {
  weekStartDate: Date;
}

const CableChart: React.FC<CableChartProps> = ({
  weekStartDate
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;

  useEffect(() => {
    fetchCablePCPData();
  }, [obraId, weekStartDate]);

  const fetchCablePCPData = async () => {
    if (!obraId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const formattedDate = weekStartDate.toISOString().split('T')[0];

      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('cabo, percentual_executado')
        .eq('obra_id', obraId)
        .eq('semana', formattedDate)
        .not('cabo', 'is', null);

      if (tarefasError) {
        console.error("Erro ao buscar tarefas:", tarefasError);
        setIsLoading(false);
        return;
      }

      if (tarefas && tarefas.length > 0) {
        const cableMap = tarefas.reduce<{
          [key: string]: {
            total: number;
            count: number;
          };
        }>((acc, task) => {
          const cable = task.cabo || "Sem cabo";
          if (!acc[cable]) {
            acc[cable] = {
              total: 0,
              count: 0
            };
          }

          if (task.percentual_executado !== null && task.percentual_executado !== undefined) {
            acc[cable].total += task.percentual_executado;
            acc[cable].count++;
          }
          return acc;
        }, {});

        let data = Object.entries(cableMap).map(([name, stats]) => ({
          name,
          value: stats.count > 0 ? stats.total / stats.count * 100 : 0
        })).sort((a, b) => b.value - a.value);

        if (data.length > 10) {
          data = data.slice(0, 10);
        }

        setChartData(data);
      } else {
        setChartData([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao processar dados de cabos:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[380px] border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium font-heading">PCP por Cabo</h3>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[380px] border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium font-heading">PCP por Cabo</h3>
        </div>
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Nenhum dado de cabo disponível para esta semana</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[380px] border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <BarChart2 className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium font-heading">PCP por Cabo</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tickFormatter={value => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={value => [`${value}%`, 'PCP']} />
          <Bar 
            dataKey="value" 
            fill="#021C2F" 
            radius={[0, 4, 4, 0]} 
          >
            <LabelList 
              dataKey="value" 
              position="right" 
              formatter={(value: number) => `${Math.round(value)}%`}
              style={{ fontSize: 11, fill: '#64748b' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CableChart;
