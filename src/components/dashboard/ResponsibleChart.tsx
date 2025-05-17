
import React, { useState, useEffect } from "react";
import { Task } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ResponsibleChartProps {
  tasks?: Task[];
  weekStartDate: Date; // Add weekStartDate prop
}

const ResponsibleChart: React.FC<ResponsibleChartProps> = ({ weekStartDate }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;
  
  useEffect(() => {
    fetchResponsiblePCPData();
  }, [obraId, weekStartDate]); // Add weekStartDate as dependency
  
  const fetchResponsiblePCPData = async () => {
    if (!obraId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format date to YYYY-MM-DD for database query
      const formattedDate = weekStartDate.toISOString().split('T')[0];
      
      // Buscar tarefas da obra para a semana selecionada
      const { data: tarefas, error: tarefasError } = await supabase
        .from('tarefas')
        .select('responsavel, percentual_executado')
        .eq('obra_id', obraId)
        .eq('semana', formattedDate); // Filter by selected week
      
      if (tarefasError) {
        console.error("Erro ao buscar tarefas:", tarefasError);
        setIsLoading(false);
        return;
      }
      
      if (tarefas && tarefas.length > 0) {
        // Agrupar por responsável e calcular média do PCP
        const responsibleMap = tarefas.reduce<{ [key: string]: { total: number, count: number } }>((acc, task) => {
          const responsible = task.responsavel || "Sem responsável";
          if (!acc[responsible]) {
            acc[responsible] = { total: 0, count: 0 };
          }
          
          // Considerar apenas tarefas com percentual executado definido
          if (task.percentual_executado !== null && task.percentual_executado !== undefined) {
            acc[responsible].total += task.percentual_executado;
            acc[responsible].count++;
          }
          
          return acc;
        }, {});
        
        // Converter para formato de gráfico e calcular o percentual médio
        let data = Object.entries(responsibleMap)
          .map(([name, stats]) => ({
            name,
            value: stats.count > 0 ? (stats.total / stats.count) * 100 : 0,
          }))
          .sort((a, b) => b.value - a.value); // Ordenar por valor decrescente
          
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
      console.error("Erro ao processar dados de responsáveis:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado disponível para esta semana</p>
      </div>
    );
  }

  // Cores para as barras em um gradiente de azul
  const COLORS = [
    '#3b82f6', '#4a89f7', '#5990f7', '#6897f8', '#779ef8', 
    '#86a5f9', '#95acf9', '#a4b3fa', '#b3bafa', '#c2c1fb'
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis 
          type="number"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={70}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'PCP']}
          labelFormatter={(name) => `Responsável: ${name}`}
        />
        <Bar 
          dataKey="value" 
          name="PCP"
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResponsibleChart;
