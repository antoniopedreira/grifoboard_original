
import { useState, useEffect, useRef } from "react";
import { Task, WeeklyPCPData } from "@/types";
import { 
  calculatePCP, 
  generateMockTasks, 
  getWeekStartDate,
  generateWeeklyPCPData
} from "@/utils/pcp";

export function useWeeklyData() {
  const [weekStartDate, setWeekStartDate] = useState<Date>(getWeekStartDate(new Date()));
  const [weekEndDate, setWeekEndDate] = useState<Date>(new Date(weekStartDate));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyPCPData, setWeeklyPCPData] = useState<WeeklyPCPData[]>([]);
  
  // Store historical PCP data for consistency when navigating between weeks
  const historicalDataRef = useRef<Map<string, number>>(new Map());
  
  // Initialize tasks and weekly data when component mounts or week changes
  useEffect(() => {
    // Set end date based on start date
    const endDate = new Date(weekStartDate);
    endDate.setDate(weekStartDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    setWeekEndDate(endDate);
    
    // Generate new tasks for the current week
    const newTasks = generateMockTasks(weekStartDate);
    setTasks(newTasks);
    
    // Calculate PCP for the current week's tasks
    const pcpData = calculatePCP(newTasks);
    const currentWeekPCP = Math.round(pcpData.overall.percentage);
    
    // Store the current week's PCP in historical data
    const weekKey = weekStartDate.toISOString().split('T')[0];
    historicalDataRef.current.set(weekKey, currentWeekPCP);
    
    // Generate weekly PCP data with consistent historical values
    setWeeklyPCPData(
      generateWeeklyPCPData(weekStartDate, currentWeekPCP, historicalDataRef.current)
    );
  }, [weekStartDate]);
  
  const updateHistoricalDataAndCharts = (updatedTasks: Task[]) => {
    // Recalculate PCP
    const newPcpData = calculatePCP(updatedTasks);
    const currentWeekPCP = Math.round(newPcpData.overall.percentage);
    
    // Update historical data for current week
    const weekKey = weekStartDate.toISOString().split('T')[0];
    historicalDataRef.current.set(weekKey, currentWeekPCP);
    
    // Update weekly data to match the current week's actual PCP
    setWeeklyPCPData(
      generateWeeklyPCPData(weekStartDate, currentWeekPCP, historicalDataRef.current)
    );
  };
  
  return {
    weekStartDate,
    setWeekStartDate,
    weekEndDate,
    tasks,
    setTasks,
    weeklyPCPData,
    updateHistoricalDataAndCharts
  };
}
