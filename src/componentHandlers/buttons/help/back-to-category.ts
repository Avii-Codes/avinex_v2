import { ButtonInteraction, MessageFlags } from 'discord.js';
import { registerButton } from '../../index';
import { createCategoryContainer } from '../../../lib/ui/help';

// Register handler for back to category button (pattern: help:back:cat:*)
registerButton('help:back:cat:', async (interaction: ButtonInteraction) => {
    // Extract category from custom ID
    const category = interaction.customId.split(':')[3];
    const container = createCategoryContainer(category);

    await interaction.update({
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    });
});
