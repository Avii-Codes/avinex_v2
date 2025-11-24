"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const help_1 = require("../../../lib/ui/help");
// Register handler for category selection
(0, index_1.registerSelectMenu)('help:cat', async (interaction) => {
    const category = interaction.values[0];
    const container = (0, help_1.createCategoryContainer)(category);
    await interaction.update({
        components: [container],
        flags: [discord_js_1.MessageFlags.IsComponentsV2]
    });
});
//# sourceMappingURL=category-select.js.map