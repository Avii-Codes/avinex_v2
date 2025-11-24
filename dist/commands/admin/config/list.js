"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../lib/components");
const discord_js_1 = require("discord.js");
const guildConfigManager_1 = require("../../../utils/guildConfigManager");
const command = {
    name: 'list',
    description: 'List all customized commands',
    level: 'Admin',
    async run(ctx) {
        const customized = await guildConfigManager_1.guildConfigManager.getCustomizedCommands(ctx.guild.id);
        const container = new components_1.Container()
            .addText('## Customized Commands')
            .addSeparator({ spacing: 'small', divider: true });
        if (customized.size === 0) {
            container.addText('*No customized commands. All commands use default settings.*');
        }
        else {
            const list = Array.from(customized.entries())
                .map(([name, cfg]) => `• \`${name}\`: ${cfg.enabled ? '✅' : '❌'}`)
                .join('\n');
            container.addText(list);
        }
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=list.js.map