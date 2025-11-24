"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../../utils/guildConfigManager");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'cooldown',
    description: 'Set custom cooldown for a command',
    args: '<command:string> <seconds:number>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName, seconds } = ctx.args;
        await guildConfigManager_1.guildConfigManager.setCommandConfig(ctx.guild.id, cmdName, { cooldown: seconds });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **Cooldown Updated**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`Command: \`${cmdName}\`\nCooldown: ${seconds}s`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=cooldown.js.map