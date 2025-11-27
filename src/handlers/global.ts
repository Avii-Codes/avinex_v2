import { ComponentRegistry } from '../plugins/router/registry';
import { ComponentContext } from '../plugins/converter/types';

/**
 * Register global component handlers that are available to all commands.
 * These handlers can be invoked using their string ID.
 */
export function registerGlobalHandlers() {
    // Example: Cancel Button
    ComponentRegistry.registerComponentHandler('global_cancel', async (ctx: ComponentContext) => {
        await ctx.interaction.reply({ content: '❌ Cancelled.', ephemeral: true });
    });

    // Example: Close/Dismiss Button
    ComponentRegistry.registerComponentHandler('global_close', async (ctx: ComponentContext) => {
        if (ctx.interaction.message) {
            await ctx.interaction.message.delete();
        }
        await ctx.interaction.reply({ content: '✅ Closed.', ephemeral: true });
    });

    console.log('[Router] Global handlers registered.');
}
