
import React, { useState, useEffect } from "react";
import { WeeklyPCPData } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PCPWeeklyChartProps {
  weeklyData?: WeeklyPCPData[];
}

const PCPWeeklyChart: React.FC<PCPWeeklyChartProps> = ({ weeklyData }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userSession } = useAuth();
  const obraId = userSession?.obraAtiva?.id;

  useEffect(() => {
    if (weeklyData && weeklyData.length > 0) {
      // Se tiver dados semanais de PCP, use-os
      const formattedData = weeklyData.map((item) => {
        const formattedDate = item.date && isValid(item.date) 
          ? format(item.date, "dd/MM", { locale: ptBR }) 
          : `Semana ${item.week}`;
          
        return {
          name: formattedDate,
          value: item.percentage,
          isCurrentWeek: item.isCurrentWeek
        };
      });
      
      setChartData(formattedData);
      setIsLoading(false);
    } else {
      // Caso contrário, busque dados da tabela resumo_execucao_semanal
      fetchResumoExecucaoData();
    }
  }, [weeklyData, obraId]);

  const fetchResumoExecucaoData = async () => {
    if (!obraId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('resumo_execucao_semanal')
        .select('semana, percentual_concluido')
        .eq('obra_id', obraId)
        .order('semana', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar dados de execução:", error);
        setIsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        const formattedData = data.map((item, index) => {
          const date = item.semana ? new Date(item.semana) : null;
          const formattedDate = date && isValid(date)
            ? format(date, "dd/MM", { locale: ptBR })
            : `Semana ${index + 1}`;
            
          return {
            name: formattedDate,
            value: item.percentual_concluido || 0,
            isCurrentWeek: index === data.length - 1 // Assume que o último é a semana atual
          };
        });
        
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Erro ao processar dados de execução:", err);
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
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  // Cores para barras normais e barras destacadas (semana atual)
  const barColors = {
    normal: "#38bdf8", // Azul claro
    current: "#0284c7"  // Azul escuro para a semana atual
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={chartData} 
        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'PCP']}
          labelFormatter={(name) => `Semana: ${name}`}
        />
        <Bar 
          dataKey="value" 
          name="PCP Semanal" 
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isCurrentWeek ? barColors.current : barColors.normal} 
              stroke={entry.isCurrentWeek ? "#0369a1" : ""}
              strokeWidth={entry.isCurrentWeek ? 1 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PCPWeeklyChart;
