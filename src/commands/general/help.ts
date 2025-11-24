import { HybridCommand } from '../../plugins/converter/types';
import { AttachmentBuilder, MessageFlags } from 'discord.js';
import { createMainHelpContainer } from '../../lib/ui/help';

const command: HybridCommand = {
    name: 'help',
    description: 'View all available commands and get help',
    type: 'both',
    args: '[command:string?]',
    async run(ctx) {
        // If specific command requested, show command details (TODO)
        if (ctx.args.command) {
            await ctx.reply({ content: 'Command-specific help coming soon!' });
            return;
        }

        const container = createMainHelpContainer(ctx.client);

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
