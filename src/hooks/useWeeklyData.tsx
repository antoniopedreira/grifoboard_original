
import { useState, useEffect, useRef } from "react";
import { Task, WeeklyPCPData } from "@/types";
import { 
  calculatePCP, 
  generateMockTasks, 
  getWeekStartDate,
  getPreviousWeekDates
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
  
  // Generate weekly PCP data for current and previous weeks
  const generateWeeklyPCPData = (currentWeekStart: Date): WeeklyPCPData[] => {
    const result: WeeklyPCPData[] = [];
    
    // Add data for 3 previous weeks and current week
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (7 * i));
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      // Try to get stored PCP value for this week
      let pcpValue = historicalDataRef.current.get(weekKey);
      
      // If no stored value, generate mock tasks and calculate PCP for this week
      if (pcpValue === undefined) {
        // For past weeks without data, generate mock tasks
        const weekTasks = generateMockTasks(weekStart);
        weeklyTasksRef.current.set(weekKey, weekTasks);
        
        // Calculate PCP
        const pcpData = calculatePCP(weekTasks);
        pcpValue = Math.round(pcpData.overall.percentage);
        
        // Store for future use
        historicalDataRef.current.set(weekKey, pcpValue);
      }
      
      // Add to results
      result.push({
        week: `Week ${i+1}`,
        percentage: pcpValue,
        date: weekStart,
        isCurrentWeek: i === 0  // Current week is at i=0
      });
    }
    
    return result;
  };
  
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
    
    // Store the current week's PCP in historical data
    historicalDataRef.current.set(weekKey, currentWeekPCP);
    
    // Generate weekly PCP data with current week and 3 previous
    setWeeklyPCPData(generateWeeklyPCPData(weekStartDate));
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
    
    // Update weekly data with new PCP values
    setWeeklyPCPData(generateWeeklyPCPData(weekStartDate));
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
