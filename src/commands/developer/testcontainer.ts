import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'testcontainer',
    description: 'Test new Container editing and disabling features',
    run: async (ctx) => {
        await sendTestMessage(ctx);
    },
    components: {
        update_text: async (ctx) => {
            const container = createBaseContainer(ctx);
            // Index 1 is the "Original Text Component"
            container.updateText(1, '✅ **Text Updated** via `updateText()`!');
            await ctx.interaction.update({ components: [container] });
        },
        update_btn: async (ctx) => {
            const container = createBaseContainer(ctx);
            // Row is now at Index 3 (Title + Text + Section + Row)
            // Button is at Index 1 ("Update Button")
            container.updateButton(3, 1, {
                label: 'Updated!',
                style: 'success',
                emoji: '🎉',
                disabled: true
            });
            await ctx.interaction.update({ components: [container] });
        },
        disable_all: async (ctx) => {
            const container = createBaseContainer(ctx);
            container.disable(); // Disable everything
            await ctx.interaction.update({ components: [container] });
        },
        disable_sel: async (ctx) => {
            const container = createBaseContainer(ctx);
            container.disable({ buttons: true }); // Disable only buttons
            await ctx.interaction.update({ components: [container] });
        },
        remove_section: async (ctx) => {
            const container = createBaseContainer(ctx);
            // Section is at Index 2
            container.removeComponent(2);
            await ctx.interaction.update({ components: [container] });
        },
        reset: async (ctx) => {
            await sendTestMessage(ctx);
        }
    }
};

function createBaseContainer(ctx: any): Container {
    return new Container()
        .setColor('#0099ff')
        .addText('## 🧪 Container Feature Test') // Index 0
        .addText('**Original Text Component** (Index 1)') // Index 1
        .addSection({ // Index 2
            texts: ['**Section Component** (Index 2)', 'Has a button accessory'],
            accessory: {
                type: 'button',
                label: 'Section Button',
                customId: 'noop',
                style: 'secondary',
                disabled: true
            }
        })
        .addActionRow({ // Index 3
            buttons: [
                { label: 'Update Text', customId: ctx.createId('update_text'), style: 'primary' },
                { label: 'Update Button', customId: ctx.createId('update_btn'), style: 'primary' },
                { label: 'Disable All', customId: ctx.createId('disable_all'), style: 'danger' },
                { label: 'Disable Btns', customId: ctx.createId('disable_sel'), style: 'danger' },
                { label: 'Remove Section', customId: ctx.createId('remove_section'), style: 'danger' }
            ]
        })
        .addActionRow({ // Index 4
            buttons: [
                { label: 'Reset Test', customId: ctx.createId('reset'), style: 'secondary', emoji: '🔄' }
            ]
        })
        .addActionRow({
            menu: {
                type: 'string',
                customId: 'menu1',
                placeholder: 'Choose an option',
                options: [
                    {
                        label: 'Option A',
                        value: 'A',
                        description: 'First option',
                        emoji: '🅰️'
                    },
                    {
                        label: 'Option B',
                        value: 'B',
                        description: 'Second option',
                        emoji: '🅱️'
                    }
                ],
                minValues: 1,
                maxValues: 2,
                disabled: false
            }
        });
}

async function sendTestMessage(ctx: any) {
    const container = createBaseContainer(ctx);
    if (ctx.interaction && ctx.interaction.isMessageComponent()) {
        await ctx.interaction.update({
            // Content removed to fix V2 error
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    } else {
        await ctx.reply({
            // Content removed to fix V2 error
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}

export default command;
