import { Container } from '../components';
import type { Client } from 'discord.js';
/**
 * Create the main help container showing all categories
 */
export declare function createMainHelpContainer(client: Client): Container;
/**
 * Create a category view container showing commands in a specific category
 */
export declare function createCategoryContainer(category: string): Container;
/**
 * Create a command detail container showing information about a specific command
 */
export declare function createCommandDetailContainer(commandName: string, category: string): Container;
//# sourceMappingURL=help.d.ts.map