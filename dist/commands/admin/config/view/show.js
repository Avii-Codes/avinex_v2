"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../../utils/guildConfigManager");
const command = {
    name: 'show',
    description: 'Show configuration for a command',
    args: '<command:string>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName } = ctx.args;
        const config = await guildConfigManager_1.guildConfigManager.getCommandConfig(ctx.guild.id, cmdName);
        const container = new components_1.Container()
            .addText(`## Configuration: \`${cmdName}\``)
            .addSeparator({ spacing: 'small', divider: true })
            .addText([
            `**Enabled:** ${config.enabled ? '✅ Yes' : '❌ No'}`,
            `**Aliases:** ${config.aliases.length ? config.aliases.map((a) => `\`${a}\``).join(', ') : 'None'}`,
            `** Cooldown:** ${config.cooldown}s`
        ].join('\n'));
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=show.js.map