"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const help_1 = require("../../../lib/ui/help");
const emoji_1 = require("../../../lib/emoji");
const registry_1 = require("../../../plugins/converter/registry");
// Register handler for command selection (pattern: help:cmd:*)
(0, index_1.registerSelectMenu)('help:cmd:', async (interaction) => {
    const commandName = interaction.values[0];
    const command = registry_1.registry.get(commandName);
    if (!command) {
        await interaction.reply({ content: `${emoji_1.Status.error} Command not found!`, ephemeral: true });
        return;
    }
    // Extract category from custom ID
    const category = interaction.customId.split(':')[2];
    const container = (0, help_1.createCommandDetailContainer)(commandName, category);
    await interaction.update({
        components: [container],
        flags: [discord_js_1.MessageFlags.IsComponentsV2]
    });
});
//# sourceMappingURL=command-select.js.map