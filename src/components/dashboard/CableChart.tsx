
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

      // Format date to YYYY-MM-DD for database query
      const formattedDate = weekStartDate.toISOString().split('T')[0];

      // Buscar todas as tarefas da obra com cabo e percentual executado para a semana selecionada
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('cabo, percentual_executado')
        .eq('obra_id', obraId)
        .eq('semana', formattedDate) // Filter by selected week
        .not('cabo', 'is', null); // Apenas tarefas com cabo definido

      if (tarefasError) {
        console.error("Erro ao buscar tarefas:", tarefasError);
        setIsLoading(false);
        return;
      }

      if (tarefas && tarefas.length > 0) {
        // Agrupar por cabo e calcular média do PCP
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

          // Considerar apenas tarefas com percentual executado definido
          if (task.percentual_executado !== null && task.percentual_executado !== undefined) {
            acc[cable].total += task.percentual_executado;
            acc[cable].count++;
          }
          return acc;
        }, {});

        // Converter para formato de gráfico e calcular o percentual médio
        let data = Object.entries(cableMap).map(([name, stats]) => ({
          name,
          value: stats.count > 0 ? stats.total / stats.count * 100 : 0
        })).sort((a, b) => b.value - a.value); // Ordenar por valor decrescente

        // Limitar para os 10 principais, se houver mais que isso
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
      <Card className="w-full h-[380px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">PCP por Cabo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full h-[380px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">PCP por Cabo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Nenhum dado de cabo disponível para esta semana</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[380px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">PCP por Cabo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={value => `${value}%`} 
              tick={{
                fontSize: 12
              }} 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={70} 
              tick={{
                fontSize: 12
              }} 
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'PCP']} 
              labelFormatter={name => `Cabo: ${name}`} 
            />
            <Bar 
              dataKey="value" 
              name="PCP" 
              fill="#021C2F" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CableChart;
