import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'confirm',
    description: 'Test confirmation dialog with state',
    run: async (ctx) => {
        const action = 'Delete 100 messages';

        // Store confirmation details with 30-second expiration
        const confirmId = ctx.createId('yes', {
            action,
            timestamp: Date.now(),
            userId: ctx.user.id
        }, 30);

        const cancelId = 'global_cancel';

        const container = new Container()
            .addText(`⚠️ **Confirmation Required**\n\n**Action:** ${action}\n**User:** ${ctx.user.tag}\n\n*This confirmation expires in 30 seconds*`)
            .addActionRow({
                buttons: [
                    { customId: confirmId, label: '✅ Confirm', style: 'success' },
                    { customId: cancelId, label: '❌ Cancel', style: 'danger' }
                ]
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2],
            ephemeral: true
        });
    },

    components: {
        yes: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Confirmation expired (30 seconds passed)',
                    ephemeral: true
                });
            }

            const { action, timestamp, userId } = ctx.state;
            const elapsed = Math.round((Date.now() - timestamp) / 1000);

            const container = new Container()
                .addText(`✅ **Confirmed!**\n\n**Action:** ${action}\n**User:** <@${userId}>\n**Response Time:** ${elapsed}s`);

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
    }
};

export default command;
