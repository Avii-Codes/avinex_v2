"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const Guild_1 = require("../../../../database/models/Guild");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'moderator',
    description: 'Remove a moderator role or user from this server',
    args: '<type:string> <id:string>',
    level: 'Admin',
    async run(ctx) {
        const { type, id } = ctx.args;
        if (type !== 'role' && type !== 'user') {
            const container = new components_1.Container()
                .addText(`${emoji_1.Status.error} **Invalid Type**`)
                .addText('Type must be either `role` or `user`');
            return ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
        }
        const field = type === 'role' ? 'permissions.moderatorRoles' : 'permissions.moderatorUsers';
        await Guild_1.GuildModel.findOneAndUpdate({ guildId: ctx.guild.id }, { $pull: { [field]: id } });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **Moderator Removed**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`Removed ${type} \`${id}\` from moderators`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=moderator.js.map