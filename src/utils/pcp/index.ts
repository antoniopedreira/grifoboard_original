
// Re-export all functions from the individual files
// but avoid naming conflicts with specific exports

import * as dateUtils from './dateUtils';
import * as textUtils from './textUtils';
import * as pcpCalculator from './pcpCalculator';
import * as mockDataGenerator from './mockDataGenerator';

// Re-export all modules
export * from './dateUtils';
export * from './textUtils';
export * from './mockDataGenerator';

// Selectively re-export from pcpCalculator to avoid naming conflicts
export const { calculatePCP, storeHistoricalPCPData } = pcpCalculator;

// Re-export generateWeeklyPCPData with a different name to avoid conflicts
// This allows existing code to use either import path without ambiguity
import { generateWeeklyPCPData as originalGenerateWeeklyPCPData } from './pcpCalculator';
export { originalGenerateWeeklyPCPData as generateWeeklyPCPData };
