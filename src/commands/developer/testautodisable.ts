import { HybridCommand } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const testautodisable: HybridCommand = {
    name: 'testautodisable',
    description: 'Test the auto-disable system and debounce logic',
    run: async (ctx) => {
        const container = new Container()
            .addText('## ⏱️ Auto-Disable Test')
            .addText('This message will auto-disable in **10 seconds**.')
            .addText('Click the button below rapidly to test debounce logic.')
            .addActionRow({
                buttons: [
                    { label: 'Click Me!', style: 'primary', customId: ctx.createId('test_click') },
                    { label: 'Refresh Timer', style: 'secondary', customId: ctx.createId('test_refresh') },
                    { label: 'Global Test', style: 'success', customId: ctx.createId('global_test') }
                ]
            });

        const msg = await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });

        // Register for auto-disable
        if (msg) {
            console.log(`[Test] Initial Reply ID: ${msg.id} (Type: ${msg.constructor.name})`);
            await ctx.registerAutoDisable(msg, container, 10);
        }
    },
    components: {
        'test_click': async (ctx) => {
            await ctx.interaction.reply({ content: '✅ Button clicked!', ephemeral: true });
        },
        'test_refresh': async (ctx) => {
            await ctx.interaction.reply({ content: '🔄 Timer refreshed! (Not really, just testing interaction)', ephemeral: true });

            if (ctx.interaction.message) {
                console.log(`[Test] Refresh Message ID: ${ctx.interaction.message.id}`);
            }

            const newContainer = new Container()
                .addText('## ⏱️ Auto-Disable Test (Refreshed)')
                .addText('Timer should have been reset (if logic supported it, but for now checking stability).')
                .addActionRow({
                    buttons: [
                        { label: 'Click Me!', style: 'primary', customId: ctx.createId('test_click') },
                        { label: 'Refresh Timer', style: 'secondary', customId: ctx.createId('test_refresh') },
                        { label: 'Global Test', style: 'success', customId: ctx.createId('global_test') }
                    ]
                });

            // Re-register to test timer clearing/resetting
            if (ctx.interaction.message) {
                await ctx.registerAutoDisable(ctx.interaction.message, newContainer, 10);
                await ctx.interaction.message.edit({
                    components: [newContainer],
                    flags: [MessageFlags.IsComponentsV2]
                });
            }
        },
        'global_test': async (ctx) => {
            // Simulate a "global" scenario where we might use the static method
            // In a real global handler, ctx is available, but this tests the static method via instance wrapper
            await ctx.interaction.reply({ content: '🌍 Global Handler Test: This button also respects the auto-disable timer.', ephemeral: true });
        }
    }
};

export default testautodisable;
