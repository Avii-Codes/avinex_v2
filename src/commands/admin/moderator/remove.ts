
import { HybridCommand } from '../../../plugins/converter/types';
import { GuildModel } from '../../../database/models/Guild';
import { Container } from '../../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'remove',
    description: 'Remove a moderator (user or role)',
    type: 'both',
    level: 'Admin',
    args: '<user:user?> <role:role?>',
    async run(ctx) {
        const { user, role } = ctx.args;
        const guildId = ctx.guild!.id;

        if (!user && !role) {
            const container = new Container()
                .addText('❌ Please provide a user or a role.');
            await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
            return;
        }

        if (user && role) {
            const container = new Container()
                .addText('❌ Please provide either a user OR a role, not both.');
            await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
            return;
        }

        const guildData = await GuildModel.findOne({ guildId });
        if (!guildData) {
            const container = new Container()
                .addText('❌ Guild data not found.');
            await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
            return;
        }

        // Initialize arrays if they don't exist
        if (!guildData.settings.moderation.moderatorUsers) guildData.settings.moderation.moderatorUsers = [];
        if (!guildData.settings.moderation.moderatorRoles) guildData.settings.moderation.moderatorRoles = [];

        const targetId = user ? user.id : role.id;
        const targetType = user ? 'User' : 'Role';
        const targetName = user ? user.username : role.name;
        const targetMention = user ? `<@${user.id}>` : `<@&${role.id}>`;

        if (user) {
            const index = guildData.settings.moderation.moderatorUsers.indexOf(targetId);
            if (index === -1) {
                const container = new Container()
                    .addText(`⚠️ ${targetType} **${targetName}** is not a moderator.`);
                await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
                return;
            }
            guildData.settings.moderation.moderatorUsers.splice(index, 1);
        } else {
            const index = guildData.settings.moderation.moderatorRoles.indexOf(targetId);
            if (index === -1) {
                const container = new Container()
                    .addText(`⚠️ ${targetType} **${targetName}** is not a moderator.`);
                await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
                return;
            }
            guildData.settings.moderation.moderatorRoles.splice(index, 1);
        }

        await guildData.save();
        const container = new Container()
            .addText(`✅ Removed ${targetType} ${targetMention} from moderators.`);
        await ctx.reply({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
};

export default command;
