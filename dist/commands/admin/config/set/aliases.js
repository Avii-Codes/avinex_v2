"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../../utils/guildConfigManager");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'aliases',
    description: 'Set custom aliases for a command',
    args: '<command:string> <aliases:string>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName, aliases: aliasesStr } = ctx.args;
        const aliases = aliasesStr.split(',').map((a) => a.trim());
        await guildConfigManager_1.guildConfigManager.setCommandConfig(ctx.guild.id, cmdName, { aliases });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **Aliases Updated**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`Command: \`${cmdName}\`\nAliases: ${aliases.map((a) => `\`${a}\``).join(', ')}`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=aliases.js.map