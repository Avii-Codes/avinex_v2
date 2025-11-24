"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../../utils/guildConfigManager");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'disable',
    description: 'Disable a command in this server',
    args: '<command:string>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName } = ctx.args;
        await guildConfigManager_1.guildConfigManager.setCommandConfig(ctx.guild.id, cmdName, { enabled: false });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.warning} **Command Disabled**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`\`${cmdName}\` is now disabled in this server`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=disable.js.map