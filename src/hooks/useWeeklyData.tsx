
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
  
  // Store tasks by week start date
  const weeklyTasksRef = useRef<Map<string, Task[]>>(new Map());
  
  // Initialize tasks and weekly data when component mounts or week changes
  useEffect(() => {
    // Set end date based on start date
    const endDate = new Date(weekStartDate);
    endDate.setDate(weekStartDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    setWeekEndDate(endDate);
    
    // Get weekly key for storage
    const weekKey = weekStartDate.toISOString().split('T')[0];
    
    // Check if we already have tasks for this week
    let currentWeekTasks: Task[];
    if (weeklyTasksRef.current.has(weekKey)) {
      // Use stored tasks for this week
      currentWeekTasks = weeklyTasksRef.current.get(weekKey)!;
    } else {
      // Generate new tasks for the current week and store them
      currentWeekTasks = generateMockTasks(weekStartDate);
      weeklyTasksRef.current.set(weekKey, currentWeekTasks);
    }
    
    // Update current tasks state
    setTasks(currentWeekTasks);
    
    // Calculate PCP for the current week's tasks
    const pcpData = calculatePCP(currentWeekTasks);
    const currentWeekPCP = Math.round(pcpData.overall.percentage);
    
    // Store the current week's PCP in historical data if not already set
    if (!historicalDataRef.current.has(weekKey)) {
      historicalDataRef.current.set(weekKey, currentWeekPCP);
    }
    
    // Generate weekly PCP data with consistent historical values
    setWeeklyPCPData(
      generateWeeklyPCPData(weekStartDate, historicalDataRef.current.get(weekKey) || currentWeekPCP, historicalDataRef.current)
    );
  }, [weekStartDate]);
  
  const updateHistoricalDataAndCharts = (updatedTasks: Task[]) => {
    // Get weekly key for storage
    const weekKey = weekStartDate.toISOString().split('T')[0];
    
    // Update tasks in storage
    weeklyTasksRef.current.set(weekKey, updatedTasks);
    
    // Recalculate PCP
    const newPcpData = calculatePCP(updatedTasks);
    const currentWeekPCP = Math.round(newPcpData.overall.percentage);
    
    // Update historical data for current week
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
