"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerButton = registerButton;
exports.registerSelectMenu = registerSelectMenu;
exports.getButtonHandler = getButtonHandler;
exports.getSelectMenuHandler = getSelectMenuHandler;
exports.clearHandlers = clearHandlers;
exports.getHandlerStats = getHandlerStats;
/**
 * Handler registries
 */
const buttonHandlers = new Map();
const selectMenuHandlers = new Map();
/**
 * Register a button handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
function registerButton(customId, handler) {
    buttonHandlers.set(customId, handler);
}
/**
 * Register a select menu handler
 * @param customId The custom ID or pattern (supports wildcards)
 * @param handler The handler function
 */
function registerSelectMenu(customId, handler) {
    selectMenuHandlers.set(customId, handler);
}
/**
 * Get a button handler by custom ID
 * Supports exact match and pattern matching
 */
function getButtonHandler(customId) {
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
function getSelectMenuHandler(customId) {
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
function clearHandlers() {
    buttonHandlers.clear();
    selectMenuHandlers.clear();
}
/**
 * Get handler statistics
 */
function getHandlerStats() {
    return {
        buttons: buttonHandlers.size,
        selectMenus: selectMenuHandlers.size,
    };
}
//# sourceMappingURL=index.js.map