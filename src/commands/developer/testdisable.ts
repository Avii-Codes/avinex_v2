import { HybridCommand } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const testdisable: HybridCommand = {
    name: 'testdisable',
    description: 'Test the granular disable functionality of the Container class',
    run: async (ctx) => {
        const container = new Container()
            .addText('## 🚫 Disable Functionality Test')
            .addText('Use the controls below to test disabling specific component types.')
            .addDivider()
            .addText('### Interactive Components')

            // Row 1: String Select Menu
            .addActionRow({
                menu: {
                    type: 'string',
                    customId: ctx.createId('test_string_menu'),
                    placeholder: 'Select an option (String)',
                    options: [
                        { label: 'Option A', value: 'a', description: 'This is option A' },
                        { label: 'Option B', value: 'b', description: 'This is option B' }
                    ]
                }
            })

            // Row 2: User Select Menu
            .addActionRow({
                menu: {
                    type: 'user',
                    customId: ctx.createId('test_user_menu'),
                    placeholder: 'Select a user'
                }
            })

            // Row 3: Channel Select Menu
            .addActionRow({
                menu: {
                    type: 'channel',
                    customId: ctx.createId('test_channel_menu'),
                    placeholder: 'Select a channel'
                }
            })

            // Row 4: Control Buttons
            .addActionRow({
                buttons: [
                    { label: 'Disable All', style: 'danger', customId: ctx.createId('disable_all') },
                    { label: 'Disable Buttons', style: 'secondary', customId: ctx.createId('disable_buttons') },
                    { label: 'Disable Menus', style: 'secondary', customId: ctx.createId('disable_menus') },
                    { label: 'Reset', style: 'success', customId: ctx.createId('reset') }
                ]
            });


        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },
    components: {
        'test_string_menu': async (ctx) => { await ctx.interaction.reply({ content: 'String menu interaction received!', ephemeral: true }); },
        'test_user_menu': async (ctx) => { await ctx.interaction.reply({ content: 'User menu interaction received!', ephemeral: true }); },
        'test_channel_menu': async (ctx) => { await ctx.interaction.reply({ content: 'Channel menu interaction received!', ephemeral: true }); },

        'disable_all': async (ctx) => {
            await updateContainer(ctx, (c) => c.disable());
        },
        'disable_buttons': async (ctx) => {
            await updateContainer(ctx, (c) => c.disable({ buttons: true }));
        },
        'disable_menus': async (ctx) => {
            await updateContainer(ctx, (c) => c.disable({ selectMenus: true }));
        },
        'reset': async (ctx) => {
            // Just re-render the fresh container (which is enabled by default)
            await updateContainer(ctx, () => { });
        }
    }
};

// Helper to reconstruct and update the container
async function updateContainer(ctx: any, modifyFn: (c: Container) => void) {
    const container = new Container()
        .addText('## 🚫 Disable Functionality Test')
        .addText('Use the controls below to test disabling specific component types.')
        .addDivider()
        .addText('### Interactive Components')

        // Row 1: String Select Menu
        .addActionRow({
            menu: {
                type: 'string',
                customId: ctx.createId('test_string_menu'),
                placeholder: 'Select an option (String)',
                options: [
                    { label: 'Option A', value: 'a', description: 'This is option A' },
                    { label: 'Option B', value: 'b', description: 'This is option B' }
                ]
            }
        })

        // Row 2: User Select Menu
        .addActionRow({
            menu: {
                type: 'user',
                customId: ctx.createId('test_user_menu'),
                placeholder: 'Select a user'
            }
        })

        // Row 3: Channel Select Menu
        .addActionRow({
            menu: {
                type: 'channel',
                customId: ctx.createId('test_channel_menu'),
                placeholder: 'Select a channel'
            }
        })

        // Row 4: Control Buttons
        .addActionRow({
            buttons: [
                { label: 'Disable All', style: 'danger', customId: ctx.createId('disable_all') },
                { label: 'Disable Buttons', style: 'secondary', customId: ctx.createId('disable_buttons') },
                { label: 'Disable Menus', style: 'secondary', customId: ctx.createId('disable_menus') },
                { label: 'Reset', style: 'success', customId: ctx.createId('reset') }
            ]
        });

    // Apply modification (disable logic)
    modifyFn(container);

    await ctx.interaction.message.edit({
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    });

    await ctx.interaction.reply({ content: 'Updated!', ephemeral: true });
}

export default testdisable;
