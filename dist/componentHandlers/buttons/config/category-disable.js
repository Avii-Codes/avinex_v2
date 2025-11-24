"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const discord_js_1 = require("discord.js");
const components_1 = require("../../../lib/components");
const guildConfigManager_1 = require("../../../utils/guildConfigManager");
const emoji_1 = require("../../../lib/emoji");
async function handler(interaction) {
    if (!interaction.customId.startsWith('config:category:disable:'))
        return;
    const category = interaction.customId.split(':')[3];
    await guildConfigManager_1.guildConfigManager.setCategoryConfig(interaction.guild.id, category, false);
    const container = new components_1.Container()
        .addText(`${emoji_1.Status.warning} **Category Disabled**`)
        .addSeparator({ spacing: 'small', divider: true })
        .addText(`All commands in \`${category}\` are now disabled`);
    await interaction.update({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
}
//# sourceMappingURL=category-disable.js.map