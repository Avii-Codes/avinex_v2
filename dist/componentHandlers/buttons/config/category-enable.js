"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const discord_js_1 = require("discord.js");
const components_1 = require("../../../lib/components");
const guildConfigManager_1 = require("../../../utils/guildConfigManager");
const emoji_1 = require("../../../lib/emoji");
async function handler(interaction) {
    if (!interaction.customId.startsWith('config:category:enable:'))
        return;
    const category = interaction.customId.split(':')[3];
    await guildConfigManager_1.guildConfigManager.setCategoryConfig(interaction.guild.id, category, true);
    const container = new components_1.Container()
        .addText(`${emoji_1.Status.success} **Category Enabled**`)
        .addSeparator({ spacing: 'small', divider: true })
        .addText(`All commands in \`${category}\` are now enabled`);
    await interaction.update({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
}
//# sourceMappingURL=category-enable.js.map