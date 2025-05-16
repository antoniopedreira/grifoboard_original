
// This file re-exports everything from the pcp directory
// to maintain backward compatibility

// Import all modules to selectively re-export
import * as dateUtils from './pcp/dateUtils';
import * as textUtils from './pcp/textUtils';
import * as pcpCalculator from './pcp/pcpCalculator';
import * as mockDataGenerator from './pcp/mockDataGenerator';
import { isValid } from 'date-fns';

// Re-export date utilities
export const {
  getWeekStartDate,
  getPreviousWeekDates,
  getNextWeekDates,
  formatDateRange
} = dateUtils;

// Re-export text utilities
export const {
  dayNameMap,
  getFullDayName,
  getStatusColor
} = textUtils;

// Re-export calculator utilities with safe date handling
export const {
  calculatePCP,
  storeHistoricalPCPData,
} = pcpCalculator;

// Re-export modified version of generateWeeklyPCPData with date validation
export const generateWeeklyPCPData = (
  currentWeekStart: Date,
  currentWeekPCP?: number,
  historicalData?: Map<string, number>
) => {
  // Validate the input date
  if (!isValid(currentWeekStart)) {
    console.warn("Invalid date passed to generateWeeklyPCPData:", currentWeekStart);
    currentWeekStart = new Date(); // Use current date as fallback
  }
  
  // Now call the original implementation with all parameters
  return pcpCalculator.generateWeeklyPCPData(
    currentWeekStart,
    currentWeekPCP || 0,  // Use 0 as default if not provided
    historicalData || new Map<string, number>()  // Use empty Map as default if not provided
  );
};

// Re-export mock data generator
export const {
  generateMockTasks
} = mockDataGenerator;
