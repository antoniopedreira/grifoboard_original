
import { useCallback } from "react";
import { Task, PCPBreakdown, WeeklyPCPData } from "@/types";
import { calculatePCP, generateWeeklyPCPData, storeHistoricalPCPData } from "@/utils/pcp";

export const usePCPCalculation = (historicalPCPData: Map<string, number>, setHistoricalPCPData: React.Dispatch<React.SetStateAction<Map<string, number>>>) => {
  // Enhanced PCP data calculation to include team, executor, and cable
  const calculateEnhancedPCP = useCallback((tasksList: Task[]) => {
    // Call the standard PCP calculation
    const standardPCP = calculatePCP(tasksList);
    
    // Create extended PCP data with additional breakdowns
    const pcpData: PCPBreakdown = {
      ...standardPCP,
      // Add new categories
      byTeam: {},
      byExecutor: {},
      byCable: {}
    };
    
    // Calculate by Team
    const tasksWithPlannedDays = tasksList.filter(task => task.plannedDays.length > 0);
    const teams = Array.from(new Set(tasksWithPlannedDays.map(task => task.team)));
    teams.forEach(team => {
      const teamTasks = tasksWithPlannedDays.filter(task => task.team === team);
      const teamCompletedTasks = teamTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byTeam[team] = {
        completedTasks: teamCompletedTasks,
        totalTasks: teamTasks.length,
        percentage: (teamCompletedTasks / teamTasks.length) * 100
      };
    });
    
    // Calculate by Executor
    const executors = Array.from(new Set(tasksWithPlannedDays.map(task => task.executor)));
    executors.forEach(executor => {
      const executorTasks = tasksWithPlannedDays.filter(task => task.executor === executor);
      const executorCompletedTasks = executorTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byExecutor[executor] = {
        completedTasks: executorCompletedTasks,
        totalTasks: executorTasks.length,
        percentage: (executorCompletedTasks / executorTasks.length) * 100
      };
    });
    
    // Calculate by Cable
    const cables = Array.from(new Set(tasksWithPlannedDays.map(task => task.cable)));
    cables.forEach(cable => {
      const cableTasks = tasksWithPlannedDays.filter(task => task.cable === cable);
      const cableCompletedTasks = cableTasks.filter(task => task.isFullyCompleted).length;
      pcpData.byCable[cable] = {
        completedTasks: cableCompletedTasks,
        totalTasks: cableTasks.length,
        percentage: (cableCompletedTasks / cableTasks.length) * 100
      };
    });
    
    return pcpData;
  }, []);

  // Function to calculate weekly PCP data for the dashboard
  const calculateWeeklyPCPData = useCallback((tasksList: Task[], currentWeekStart: Date) => {
    const pcpData = calculateEnhancedPCP(tasksList);
    const currentWeekPCP = pcpData.overall.percentage;
    
    // Store historical data
    const updatedHistoricalData = storeHistoricalPCPData(
      historicalPCPData,
      currentWeekStart,
      currentWeekPCP
    );
    setHistoricalPCPData(updatedHistoricalData);
    
    // Generate weekly data
    const weeklyData = generateWeeklyPCPData(
      currentWeekStart,
      currentWeekPCP,
      updatedHistoricalData
    );
    
    return {
      pcpData,
      weeklyData
    };
  }, [calculateEnhancedPCP, historicalPCPData, setHistoricalPCPData]);

  return {
    calculateEnhancedPCP,
    calculateWeeklyPCPData
  };
};
