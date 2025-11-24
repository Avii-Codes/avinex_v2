"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupComponentHandlers = setupComponentHandlers;
const componentHandlers_1 = require("../componentHandlers");
require("../componentHandlers/buttons");
require("../componentHandlers/selectMenu");
/**
 * Setup component interaction listener
 * Call this function when initializing the bot
 */
function setupComponentHandlers(client) {
    client.on('interactionCreate', async (interaction) => {
        try {
            // Handle button interactions
            if (interaction.isButton()) {
                console.log(`🔘 Button clicked: ${interaction.customId}`);
                const handler = (0, componentHandlers_1.getButtonHandler)(interaction.customId);
                if (handler) {
                    console.log(`✅ Found handler for: ${interaction.customId}`);
                    await handler(interaction);
                }
                else {
                    console.log(`❌ No handler found for: ${interaction.customId}`);
                }
                return;
            }
            // Handle string select menu interactions
            if (interaction.isStringSelectMenu()) {
                console.log(`📋 Select menu used: ${interaction.customId}`);
                const handler = (0, componentHandlers_1.getSelectMenuHandler)(interaction.customId);
                if (handler) {
                    console.log(`✅ Found handler for: ${interaction.customId}`);
                    await handler(interaction);
                }
                else {
                    console.log(`❌ No handler found for: ${interaction.customId}`);
                }
                return;
            }
        }
        catch (error) {
            console.error('❌ Error handling component interaction:', error);
            // Try to respond with error message
            try {
                const errorMessage = '❌ An error occurred while processing your interaction.';
                if (interaction.isRepliable()) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    }
                    else {
                        await interaction.reply({ content: errorMessage, ephemeral: true });
                    }
                }
            }
            catch (followUpError) {
                console.error('Failed to send error message:', followUpError);
            }
        }
    });
    console.log('✅ Component handlers registered and listener setup complete');
}
//# sourceMappingURL=componentHandler.js.map