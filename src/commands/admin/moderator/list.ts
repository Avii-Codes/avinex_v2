
import { HybridCommand } from '../../../plugins/converter/types';
import { GuildModel } from '../../../database/models/Guild';
import { Container } from '../../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'list',
    description: 'List all moderators',
    type: 'both',
    level: 'Admin',
    async run(ctx) {
        const guildId = ctx.guild!.id;
        const guildData = await GuildModel.findOne({ guildId });

        if (!guildData) {
            const container = new Container()
                .addText('❌ Guild data not found.');
            await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
            return;
        }

        const users = guildData.settings.moderation.moderatorUsers?.map(id => `<@${id}>`).join(', ') || 'None';
        const roles = guildData.settings.moderation.moderatorRoles?.map(id => `<@&${id}>`).join(', ') || 'None';

        const container = new Container()
            .addHeader('🛡️ Moderator Configuration');

        if (ctx.guild!.iconURL()) {
            container.addSection({
                texts: [
                    `**Users:** ${users}`,
                    `**Roles:** ${roles}`
                ],
                accessory: { type: 'thumbnail', url: ctx.guild!.iconURL()! }
            });
        } else {
            container.addText(`**Users:** ${users}\n**Roles:** ${roles}`);
        }

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
