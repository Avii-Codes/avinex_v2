import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';

/**
 * Component Handler Types
 */
export type ButtonHandler = (interaction: ButtonInteraction) => Promise<void>;
export type SelectMenuHandler = (interaction: StringSelectMenuInteraction) => Promise<void>;

/**
 * Handler registries
 */
const buttonHandlers = new Map<string, ButtonHandler>();
const selectMenuHandlers = new Map<string, SelectMenuHandler>();

/**
 * Register a button handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
export function registerButton(customId: string, handler: ButtonHandler): void {
    buttonHandlers.set(customId, handler);
}

/**
 * Register a select menu handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
export function registerSelectMenu(customId: string, handler: SelectMenuHandler): void {
    selectMenuHandlers.set(customId, handler);
}

/**
 * Get a button handler by custom ID
 * Supports exact match and pattern matching
 */
export function getButtonHandler(customId: string): ButtonHandler | undefined {
    // Try exact match first
    if (buttonHandlers.has(customId)) {
        return buttonHandlers.get(customId);
    }

    // Try pattern matching (e.g., "help:*")
    for (const [pattern, handler] of buttonHandlers.entries()) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            if (regex.test(customId)) {
                return handler;
            }
        }

        // Try prefix matching (e.g., "help:")
        if (pattern.endsWith(':') && customId.startsWith(pattern)) {
            return handler;
        }
    }

    return undefined;
}

/**
 * Get a select menu handler by custom ID
 * Supports exact match and pattern matching
 */
export function getSelectMenuHandler(customId: string): SelectMenuHandler | undefined {
    // Try exact match first
    if (selectMenuHandlers.has(customId)) {
        return selectMenuHandlers.get(customId);
    }

    // Try pattern matching
    for (const [pattern, handler] of selectMenuHandlers.entries()) {
        if (pattern.includes('*')) {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
            if (regex.test(customId)) {
                return handler;
            }
        }

        // Try prefix matching
        if (pattern.endsWith(':') && customId.startsWith(pattern)) {
            return handler;
        }
    }

    return undefined;
}

/**
 * Clear all handlers (useful for hot-reload)
 */
export function clearHandlers(): void {
    buttonHandlers.clear();
    selectMenuHandlers.clear();
}

/**
 * Get handler statistics
 */
export function getHandlerStats(): { buttons: number; selectMenus: number } {
    return {
        buttons: buttonHandlers.size,
        selectMenus: selectMenuHandlers.size,
    };
}
