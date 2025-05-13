
// This file now just re-exports everything from the pcp directory
// to maintain backward compatibility

// Instead of re-exporting everything, let's import and re-export specifically
// to avoid naming conflicts
import * as dateUtils from './pcp/dateUtils';
import * as textUtils from './pcp/textUtils';
import * as pcpCalculator from './pcp/pcpCalculator';
import * as mockDataGenerator from './pcp/mockDataGenerator';

// Re-export everything individually
export const {
  getWeekStartDate,
  getPreviousWeekDates,
  formatDateToDisplay
} = dateUtils;

export const {
  formatSectorName,
  truncateText
} = textUtils;

export const {
  calculatePCP,
  storeHistoricalPCPData,
  // Only export this once
  generateWeeklyPCPData
} = pcpCalculator;

export const {
  generateMockTasks
} = mockDataGenerator;
