import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'poll',
    description: 'Create a public poll (Stateless Example)',
    args: '<question:string> <options:string>',
    run: async (ctx) => {
        const question = ctx.args.question;
        const options = (ctx.args.options as string).split(',').map(o => o.trim());

        if (options.length < 2) {
            return ctx.reply({ content: '❌ Please provide at least 2 options separated by commas.', ephemeral: true });
        }

        const container = new Container()
            .addText(`📊 **${question}**`)
            .addActionRow({
                buttons: options.map((opt, index) => ({
                    // Stateless ID: poll:vote:OptionName
                    // We do NOT use ctx.createId() with data here to avoid auto-cleanup!
                    // We manually construct the ID so it persists forever.
                    customId: `poll:vote:${opt}`,
                    label: opt,
                    style: 'secondary'
                }))
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },

    components: {
        vote: async (ctx: ComponentContext) => {
            // Since we didn't use createId with state, ctx.state is null.
            // But we encoded the option in the token part of the ID!
            // ID format: poll:vote:OptionName

            // The Router puts the 3rd part of the ID into 'ctx.state' if it finds a token,
            // OR we can parse it manually from ctx.interaction.customId

            const customId = ctx.interaction.customId;
            const option = customId.split(':')[2]; // "OptionName"

            await ctx.interaction.reply({
                content: `✅ You voted for **${option}**!`,
                ephemeral: true
            });
        }
    }
};

export default command;
