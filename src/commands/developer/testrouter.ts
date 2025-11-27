import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'testrouter',
    description: 'Test the Router Plugin with state management',
    run: async (ctx) => {
        const container = new Container()
            .addText('**Router Plugin Test**\n\n1️⃣ **Simple**: Just logs a message\n2️⃣ **With State**: Increments a counter\n3️⃣ **Global**: Uses a global cancel handler')
            .addActionRow({
                buttons: [
                    {
                        customId: ctx.createId('simple'),
                        label: 'Click Me',
                        style: 'primary'
                    },
                    {
                        customId: ctx.createId('withstate', { userId: ctx.user.id, count: 0 }, 120),
                        label: 'Click with State',
                        style: 'success'
                    },
                    {
                        customId: 'global_cancel',
                        label: 'Cancel',
                        style: 'danger'
                    }
                ]
            });

        await ctx.reply({
            content: '',
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },

    components: {
        simple: async (ctx: ComponentContext) => {
            await ctx.interaction.reply({
                content: '✅ Simple button clicked! No state required.',
                ephemeral: true
            });
        },

        withstate: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '❌ State expired (2 minutes)',
                    ephemeral: true
                });
            }

            const newCount = ctx.state.count + 1;

            // Update button with new state
            const updatedContainer = new Container()
                .addText(`**Counter:** ${newCount}\n*User: ${ctx.state.userId}*`)
                .addActionRow({
                    buttons: [
                        {
                            customId: ctx.createId('withstate', { ...ctx.state, count: newCount }, 120),
                            label: `Clicks: ${newCount}`,
                            style: 'success'
                        }
                    ]
                });

            await ctx.interaction.update({
                content: '',
                components: [updatedContainer],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
    }
};

export default command;
