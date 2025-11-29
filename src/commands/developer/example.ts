import { HybridCommand } from '../../plugins/converter/types';
import { MessageFlags, AutocompleteInteraction } from 'discord.js';
import { Container } from '../../lib/components';

const example: HybridCommand = {
    name: 'example',
    description: 'A glimpse of the Avinex Hybrid Framework power',
    type: 'both',
    cooldown: 5,
    // Arguments: <name:type> for required, <name:type?> for optional
    // Use 'auto' type to enable autocomplete behavior
    args: '<required_arg:string> <optional_arg:auto?>',

    // Autocomplete Handler
    auto: async (ctx) => {
        if (ctx.raw instanceof AutocompleteInteraction) {
            const focused = ctx.raw.options.getFocused(true);

            if (focused.name === 'optional_arg') {
                const choices = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
                const filtered = choices.filter(c => c.toLowerCase().startsWith(focused.value.toLowerCase()));

                await ctx.raw.respond(
                    filtered.map(c => ({ name: c, value: c }))
                );
            }
        }
    },

    run: async (ctx) => {
        // Access parsed arguments directly
        const { required_arg, optional_arg } = ctx.args;

        // 1. Build UI with Fluent API
        const container = new Container()
            .addText('# 🚀 Framework Showcase')
            .addText(`> **Args Received:** Required: \`${required_arg}\` | Optional: \`${optional_arg || 'None'}\``)
            .addText('Building complex UIs is now incredibly simple.')
            .addDivider()

            // Add a section with an interactive button
            .addSection({
                texts: ['**State Management**', 'Buttons can "remember" data securely.'],
                accessory: {
                    type: 'button',
                    label: 'Click Me',
                    style: 'primary',
                    // Create a secure ID with embedded state (no database needed!)
                    customId: ctx.createId('click', { count: 0 })
                }
            })

            // Add a select menu
            .addActionRow({
                menu: {
                    type: 'string',
                    customId: ctx.createId('select'),
                    placeholder: 'Select an option...',
                    options: [
                        { label: 'Option A', value: 'A', emoji: '🅰️' },
                        { label: 'Option B', value: 'B', emoji: '🅱️' }
                    ]
                }
            });

        // 2. Send Response
        const msg = await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });

        // 3. Auto-Disable (One-liner!)
        // Automatically disables components after 60 seconds to save memory
        if (msg) ctx.registerAutoDisable(msg, container, 60);
    },

    components: {
        // Handle Button Click
        'click': async (ctx) => {
            // Retrieve state automatically
            let { count } = ctx.state;
            count++;

            await ctx.interaction.reply({
                content: `You clicked this button **${count}** times!`,
                ephemeral: true
            });

            // Update state for next click
            // (In a real app, you'd update the button's customId with the new count)
        },

        // Handle Selection
        'select': async (ctx) => {
            const value = ctx.interaction.values[0];
            await ctx.interaction.reply({
                content: `You selected: **${value}**`,
                ephemeral: true
            });
        }
    }
};

export default example;
