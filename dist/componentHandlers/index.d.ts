import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
/**
 * Component Handler Types
 */
export type ButtonHandler = (interaction: ButtonInteraction) => Promise<void>;
export type SelectMenuHandler = (interaction: StringSelectMenuInteraction) => Promise<void>;
/**
 * Register a button handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
export declare function registerButton(customId: string, handler: ButtonHandler): void;
/**
 * Register a select menu handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
export declare function registerSelectMenu(customId: string, handler: SelectMenuHandler): void;
/**
 * Get a button handler by custom ID
 * Supports exact match and pattern matching
 */
export declare function getButtonHandler(customId: string): ButtonHandler | undefined;
/**
 * Get a select menu handler by custom ID
 * Supports exact match and pattern matching
 */
export declare function getSelectMenuHandler(customId: string): SelectMenuHandler | undefined;
/**
 * Clear all handlers (useful for hot-reload)
 */
export declare function clearHandlers(): void;
/**
 * Get handler statistics
 */
export declare function getHandlerStats(): {
    buttons: number;
    selectMenus: number;
};
//# sourceMappingURL=index.d.ts.map