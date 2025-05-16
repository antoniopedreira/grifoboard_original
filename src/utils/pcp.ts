
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
export const generateWeeklyPCPData = (currentWeekStart: Date) => {
  // Validate the input date
  if (!isValid(currentWeekStart)) {
    console.warn("Invalid date passed to generateWeeklyPCPData:", currentWeekStart);
    currentWeekStart = new Date(); // Use current date as fallback
  }
  
  // Now call the original implementation
  return pcpCalculator.generateWeeklyPCPData(currentWeekStart);
};

// Re-export mock data generator
export const {
  generateMockTasks
} = mockDataGenerator;
