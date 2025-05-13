
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
    // We need to show 3 previous weeks and the current week
    const previousWeeks: WeeklyPCPData[] = [];
    
    // Add the previous 3 weeks
    for (let i = 3; i > 0; i--) {
      const prevDate = new Date(weekStartDate);
      prevDate.setDate(weekStartDate.getDate() - (7 * i));
      
      const prevWeekKey = prevDate.toISOString().split('T')[0];
      // If we don't have historical data for this week, use current week's PCP
      if (!historicalDataRef.current.has(prevWeekKey)) {
        // Generate a consistent value for previous weeks
        const value = Math.round(Math.random() * 30) + 60; // Generate a value between 60-90
        historicalDataRef.current.set(prevWeekKey, value);
      }
      
      previousWeeks.push({
        week: `Week -${i}`,
        percentage: historicalDataRef.current.get(prevWeekKey) || currentWeekPCP,
        date: prevDate,
        isCurrentWeek: false
      });
    }
    
    // Add current week
    previousWeeks.push({
      week: "Current Week",
      percentage: historicalDataRef.current.get(weekKey) || currentWeekPCP,
      date: new Date(weekStartDate),
      isCurrentWeek: true
    });
    
    setWeeklyPCPData(previousWeeks);
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
    // We need to show 3 previous weeks and the current week
    const previousWeeks: WeeklyPCPData[] = [];
    
    // Add the previous 3 weeks
    for (let i = 3; i > 0; i--) {
      const prevDate = new Date(weekStartDate);
      prevDate.setDate(weekStartDate.getDate() - (7 * i));
      
      const prevWeekKey = prevDate.toISOString().split('T')[0];
      // If we don't have historical data for this week, use current week's PCP
      if (!historicalDataRef.current.has(prevWeekKey)) {
        // Generate a consistent value for previous weeks
        const value = Math.round(Math.random() * 30) + 60; // Generate a value between 60-90
        historicalDataRef.current.set(prevWeekKey, value);
      }
      
      previousWeeks.push({
        week: `Week -${i}`,
        percentage: historicalDataRef.current.get(prevWeekKey) || currentWeekPCP,
        date: prevDate,
        isCurrentWeek: false
      });
    }
    
    // Add current week
    previousWeeks.push({
      week: "Current Week",
      percentage: currentWeekPCP,
      date: new Date(weekStartDate),
      isCurrentWeek: true
    });
    
    setWeeklyPCPData(previousWeeks);
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
