import { Container } from './components';
import { General, Status } from './emoji';
import { registry } from '../plugins/converter/registry';
import { HybridCommand } from '../plugins/converter/types';

/**
 * Get all unique categories from commands
 */
export function getCategories(): string[] {
    return registry.getCategories();
}

/**
 * Get all commands (simplified for now)
 */
export function getAllCommands(): Map<string, HybridCommand> {
    return registry.getFlattenedCommands();
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: string): Map<string, HybridCommand> {
    return registry.getCommandsByCategory(category);
}

/**
 * Get total command count
 */
export function getTotalCommandCount(): number {
    return getAllCommands().size;
}

/**
 * Get command count by category
 */
export function getCategoryCommandCount(category: string): number {
    return getCommandsByCategory(category).size;
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format command name for display
 */
export function formatCommandName(name: string): string {
    return name.replace(/\//g, ' ');
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
    return capitalize(category);
}
