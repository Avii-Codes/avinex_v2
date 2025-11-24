import { ButtonInteraction, MessageFlags } from 'discord.js';
import { registerButton } from '../../index';
import { createMainHelpContainer } from '../../../lib/ui/help';

// Register handler for back to main button
registerButton('help:back:main', async (interaction: ButtonInteraction) => {
    const container = createMainHelpContainer(interaction.client);

    await interaction.update({
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    });
});
