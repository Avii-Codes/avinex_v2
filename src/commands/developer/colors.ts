import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags, StringSelectMenuInteraction } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'colors',
    description: 'Test select menu with state',
    run: async (ctx) => {
        const colors = [
            { name: '🔴 Red', value: 'red', hex: '#FF0000' },
            { name: '🟢 Green', value: 'green', hex: '#00FF00' },
            { name: '🔵 Blue', value: 'blue', hex: '#0000FF' },
            { name: '🟡 Yellow', value: 'yellow', hex: '#FFFF00' },
            { name: '🟣 Purple', value: 'purple', hex: '#800080' }
        ];

        const menuId = ctx.createId('selectcolor', {
            colors,
            userId: ctx.user.id,
            selections: []
        }, 120);

        const container = new Container()
            .addText('🎨 **Color Picker**\n\nSelect your favorite colors!')
            .addActionRow({
                menu: {
                    type: 'string',
                    customId: menuId,
                    placeholder: 'Choose a color...',
                    minValues: 1,
                    maxValues: 3,
                    options: colors.map(c => ({
                        label: c.name,
                        value: c.value
                    }))
                }
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },

    components: {
        selectcolor: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Selection expired (2 minutes)',
                    ephemeral: true
                });
            }

            const interaction = ctx.interaction as StringSelectMenuInteraction;
            const selectedValues = interaction.values;

            const { colors } = ctx.state;
            const selectedColors = colors.filter((c: any) => selectedValues.includes(c.value));

            const colorList = selectedColors.map((c: any) => `${c.name} (${c.hex})`).join('\n');
            const newSelections = [...ctx.state.selections, ...selectedValues];

            const container = new Container()
                .addText(`🎨 **Color Selection**\n\n**Selected:**\n${colorList}\n\n**Total Selections:** ${newSelections.length}`)
                .addActionRow({
                    menu: {
                        type: 'string',
                        customId: ctx.createId('selectcolor', { ...ctx.state, selections: newSelections }, 120),
                        placeholder: 'Choose more colors...',
                        minValues: 1,
                        maxValues: 3,
                        options: colors.map((c: any) => ({
                            label: c.name,
                            value: c.value
                        }))
                    }
                });

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
    }
};

export default command;
