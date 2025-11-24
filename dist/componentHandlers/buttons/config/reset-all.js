"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const discord_js_1 = require("discord.js");
const components_1 = require("../../../lib/components");
const guildConfigManager_1 = require("../../../utils/guildConfigManager");
const emoji_1 = require("../../../lib/emoji");
async function handler(interaction) {
    const customId = interaction.customId;
    if (customId === 'config:resetall:confirm') {
        await guildConfigManager_1.guildConfigManager.resetAllConfigs(interaction.guild.id);
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.success} **All Configurations Reset**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText('All command and category configurations have been reset to defaults');
        await interaction.update({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
    if (customId === 'config:cancel') {
        const container = new components_1.Container()
            .addText('❌ **Cancelled**')
            .addText('No changes were made');
        await interaction.update({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
}
//# sourceMappingURL=reset-all.js.map