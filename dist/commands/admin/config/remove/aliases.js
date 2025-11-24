"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../../utils/guildConfigManager");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'aliases',
    description: 'Remove specific aliases or all custom aliases for a command',
    args: '<command:string> <aliases:string?>',
    level: 'Admin',
    async run(ctx) {
        const { command: cmdName, aliases: aliasesStr } = ctx.args;
        if (!aliasesStr) {
            // Remove all custom aliases - reset to global defaults
            await guildConfigManager_1.guildConfigManager.resetCommandConfig(ctx.guild.id, cmdName);
            const container = new components_1.Container()
                .addText(`${emoji_1.Status.success} **All Aliases Reset**`)
                .addSeparator({ spacing: 'small', divider: true })
                .addText(`All custom aliases for \`${cmdName}\` have been removed`);
            return ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
        }
        // Remove specific aliases
        const aliasesToRemove = aliasesStr.split(',').map((a) => a.trim());
        const currentConfig = await guildConfigManager_1.guildConfigManager.getCommandConfig(ctx.guild.id, cmdName);
        const newAliases = currentConfig.aliases.filter((a) => !aliasesToRemove.includes(a));
        await guildConfigManager_1.guildConfigManager.setCommandConfig(ctx.guild.id, cmdName, { aliases: newAliases });
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **Aliases Removed**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`Removed: ${aliasesToRemove.map((a) => `\`${a}\``).join(', ')}\nRemaining: ${newAliases.length ? newAliases.map((a) => `\`${a}\``).join(', ') : 'None'}`);
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=aliases.js.map