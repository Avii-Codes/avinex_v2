import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { registerSelectMenu } from '../../index';
import { createCategoryContainer } from '../../../lib/ui/help';

// Register handler for category selection
registerSelectMenu('help:cat', async (interaction: StringSelectMenuInteraction) => {
    const category = interaction.values[0];
    const container = createCategoryContainer(category);

    await interaction.update({
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    });
});
