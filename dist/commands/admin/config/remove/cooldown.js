"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const Guild_1 = require("../../../../database/models/Guild");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'cooldown',
    description: 'Remove custom cooldown for a command',
    args: '<command:string>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName } = ctx.args;
        // Remove just the cooldown field while keeping other config
        await Guild_1.GuildModel.findOneAndUpdate({ guildId: ctx.guild.id }, { $unset: { [`commandConfig.${cmdName}.cooldown`]: "" } });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **Cooldown Reset**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`Custom cooldown for \`${cmdName}\` has been removed`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=cooldown.js.map