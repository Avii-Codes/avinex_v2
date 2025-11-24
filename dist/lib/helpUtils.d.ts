import { HybridCommand } from '../plugins/converter/types';
/**
 * Get all unique categories from commands
 */
export declare function getCategories(): string[];
/**
 * Get all commands (simplified for now)
 */
export declare function getAllCommands(): Map<string, HybridCommand>;
/**
 * Get commands by category
 */
export declare function getCommandsByCategory(category: string): Map<string, HybridCommand>;
/**
 * Get total command count
 */
export declare function getTotalCommandCount(): number;
/**
 * Get command count by category
 */
export declare function getCategoryCommandCount(category: string): number;
/**
 * Capitalize first letter of string
 */
export declare function capitalize(str: string): string;
/**
 * Format command name for display
 */
export declare function formatCommandName(name: string): string;
/**
 * Get category display name
 */
export declare function getCategoryDisplayName(category: string): string;
//# sourceMappingURL=helpUtils.d.ts.map