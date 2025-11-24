"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../index");
const help_1 = require("../../../lib/ui/help");
// Register handler for back to main button
(0, index_1.registerButton)('help:back:main', async (interaction) => {
    const container = (0, help_1.createMainHelpContainer)(interaction.client);
    await interaction.update({
        components: [container],
        flags: [discord_js_1.MessageFlags.IsComponentsV2]
    });
});
//# sourceMappingURL=back-to-main.js.map