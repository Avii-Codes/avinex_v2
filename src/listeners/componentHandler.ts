import { Client, Interaction } from 'discord.js';
import { getButtonHandler, getSelectMenuHandler } from '../componentHandlers';
import '../componentHandlers/buttons';
import '../componentHandlers/selectMenu';

/**
 * Setup component interaction listener
 * Call this function when initializing the bot
 */
export function setupComponentHandlers(client: Client): void {
    client.on('interactionCreate', async (interaction: Interaction) => {
        try {
            // Handle button interactions
            if (interaction.isButton()) {
                console.log(`🔘 Button clicked: ${interaction.customId}`);
                const handler = getButtonHandler(interaction.customId);
                if (handler) {
                    console.log(`✅ Found handler for: ${interaction.customId}`);
                    await handler(interaction);
                } else {
                    console.log(`❌ No handler found for: ${interaction.customId}`);
                }
                return;
            }

            // Handle string select menu interactions
            if (interaction.isStringSelectMenu()) {
                console.log(`📋 Select menu used: ${interaction.customId}`);
                const handler = getSelectMenuHandler(interaction.customId);
                if (handler) {
                    console.log(`✅ Found handler for: ${interaction.customId}`);
                    await handler(interaction);
                } else {
                    console.log(`❌ No handler found for: ${interaction.customId}`);
                }
                return;
            }
        } catch (error) {
            console.error('❌ Error handling component interaction:', error);

            // Try to respond with error message
            try {
                const errorMessage = '❌ An error occurred while processing your interaction.';
                if (interaction.isRepliable()) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: errorMessage, ephemeral: true });
                    } else {
                        await interaction.reply({ content: errorMessage, ephemeral: true });
                    }
                }
            } catch (followUpError) {
                console.error('Failed to send error message:', followUpError);
            }
        }
    });

    console.log('✅ Component handlers registered and listener setup complete');
}
