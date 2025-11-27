import { ComponentConfig, ComponentContext, ComponentHandler, HybridCommand } from '../converter/types';

/**
 * Registry for managing component handlers and command mappings.
 * Supports Lazy Registration and Dynamic Lookup.
 */
export class ComponentRegistry {
    // Global Handlers: Explicitly registered (e.g., 'cancel', 'close_ticket')
    private static globalHandlers = new Map<string, ComponentHandler>();

    // Command Map: Maps Prefix/Alias -> Command Object
    // This allows us to find the command responsible for an ID like "poll:vote"
    private static commandMap = new Map<string, HybridCommand>();

    /**
     * Register a global component handler.
     * These handlers are available to ALL commands.
     * @param id The unique ID for the handler (e.g., 'global_cancel')
     * @param handler The function or config to execute
     */
    static registerComponentHandler(id: string, handler: ComponentHandler) {
        if (this.globalHandlers.has(id)) {
            throw new Error(`Global Component Handler with ID '${id}' is already registered.`);
        }
        this.globalHandlers.set(id, handler);
    }

    /**
     * Get a global handler by ID.
     */
    static getGlobalHandler(id: string) {
        return this.globalHandlers.get(id);
    }

    /**
     * Register a command prefix (and aliases) to a command object.
     * Used for routing "commandName:key" IDs to the correct command.
     */
    static registerCommandPrefix(prefix: string, command: HybridCommand) {
        // We map the prefix (command name or alias) to the command object
        this.commandMap.set(prefix, command);
    }

    /**
     * Find a command by its prefix (name or alias).
     */
    static getCommandByPrefix(prefix: string): HybridCommand | undefined {
        return this.commandMap.get(prefix);
    }
}
