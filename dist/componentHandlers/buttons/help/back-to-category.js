"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const help_1 = require("../../../lib/ui/help");
// Register handler for back to category button (pattern: help:back:cat:*)
(0, index_1.registerButton)('help:back:cat:', async (interaction) => {
    // Extract category from custom ID
    const category = interaction.customId.split(':')[3];
    const container = (0, help_1.createCategoryContainer)(category);
    await interaction.update({
        components: [container],
        flags: [discord_js_1.MessageFlags.IsComponentsV2]
    });
});
//# sourceMappingURL=back-to-category.js.map