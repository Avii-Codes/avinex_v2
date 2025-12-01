import { Events, Message, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';
import AISystem from '../systems/AI';
import { log } from '../utils/logger';
import { Container } from '../lib/components';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(client: ExtendedClient, message: Message) {
        // 1. Ignore bots
        if (message.author.bot) return;

        // 2. Check for Mention
        if (!client.user) return;
        if (!message.mentions.has(client.user)) return;

        // 3. Ignore @everyone and Role mentions
        if (message.mentions.everyone) return;
        if (message.mentions.roles.size > 0) return;

        // 4. Check if it's a direct reply or just a mention
        // If it's a reply to someone else but mentions bot, we might want to ignore?
        // But usually "Hey @Bot" is enough.

        // 5. Get Content (remove bot mention only)
        // We want to keep other mentions (like @User) so the AI can use them as arguments.
        const botId = client.user.id;
        const mentionRegex = new RegExp(`<@!?${botId}>`); // Remove 'g' flag to only replace first occurrence
        const content = message.content.replace(mentionRegex, '').trim();
        if (!content) return; // Ignore empty mentions

        try {
            // 6. Get AI System
            const aiSystem = client.systems.get('AI') as AISystem;
            if (!aiSystem) {
                log.warn('AI System not loaded.');
                return;
            }

            // 7. Show Thinking UI
            const thinkingContainer = new Container()
                .addText('**-# Nex is thinking...** ');


            const thinkingMsg = await message.reply({
                components: [thinkingContainer],
                flags: [MessageFlags.IsComponentsV2],
                allowedMentions: { repliedUser: false }
            });

            // 8. Ask AI with Progress Callback
            const response = await aiSystem.ask(content, message.author, message.channel as any, async (status) => {
                // Update Thinking Message
                try {
                    const updateContainer = new Container()
                        .addText(`**-# ${status}**`);

                    await thinkingMsg.edit({
                        components: [updateContainer],
                        flags: [MessageFlags.IsComponentsV2],
                        allowedMentions: { repliedUser: false }
                    });
                } catch (err) {
                    log.warn('Failed to update thinking message:', err);
                }
            });

            // 9. Edit with Final Response
            if (response) {
                if (typeof response === 'string') {
                    if (response.trim().length > 0) {

                        await thinkingMsg.edit({
                            content: undefined,
                            components: [new TextDisplayBuilder().setContent(response)],
                            flags: [MessageFlags.IsComponentsV2],
                            allowedMentions: { repliedUser: false }
                        });
                    } else {
                        // Empty response? Delete thinking message
                        await thinkingMsg.delete().catch(() => { });
                    }
                } else {
                    // It's a complex payload (MessagePayload or MessageOptions)
                    await thinkingMsg.edit(response as any);
                }
            } else {
                await thinkingMsg.delete().catch(() => { });
            }

        } catch (error) {
            log.error('Error in AI Chat:', error);
            await message.reply({
                content: 'Sorry, I had a brain freeze! 🧊',
                allowedMentions: { repliedUser: false }
            });
        }
    }
};
