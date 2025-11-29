import { ComponentContext, HybridCommand } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { createMainHelpContainer, createCategoryContainer, createCommandDetailContainer } from '../../lib/ui/help';

const command: HybridCommand = {
    name: 'help',
    description: 'View all available commands and get help',
    type: 'both',
    args: '[command:string?]',
    async run(ctx) {
        // If specific command requested, show command details (TODO: Implement direct lookup)
        if (ctx.args.command) {
            await ctx.reply({ content: 'Command-specific help coming soon! Use the menu for now.' });
            return;
        }

        const container = createMainHelpContainer(ctx);

        const msg = await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });

        if (msg) {
            ctx.registerAutoDisable(msg, container, 60);
        }
    },

    components: {
        'cat': async (ctx: ComponentContext) => {
            const category = ctx.interaction.values[0];
            const container = createCategoryContainer(ctx, category);

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });

            ctx.registerAutoDisable(ctx.interaction.message, container, 60);
        },
        'cmd': async (ctx: ComponentContext) => {
            const commandName = ctx.interaction.values[0];
            const category = ctx.state.category; // Retrieved from state stored in ID

            const container = createCommandDetailContainer(ctx, commandName, category);

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });

            ctx.registerAutoDisable(ctx.interaction.message, container, 60);
        },
        'home': async (ctx: ComponentContext) => {
            const container = createMainHelpContainer(ctx);
            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });

            ctx.registerAutoDisable(ctx.interaction.message, container, 60);
        },
        'back': async (ctx: ComponentContext) => {
            const category = ctx.state.category; // Retrieved from state stored in ID
            const container = createCategoryContainer(ctx, category);

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });

            ctx.registerAutoDisable(ctx.interaction.message, container, 60);
        }
    }
};

export default command;
