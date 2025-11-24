import { StringSelectMenuInteraction, MessageFlags } from 'discord.js';
import { registerSelectMenu } from '../../index';
import { createCommandDetailContainer } from '../../../lib/ui/help';
import { Status } from '../../../lib/emoji';
import { registry } from '../../../plugins/converter/registry';

// Register handler for command selection (pattern: help:cmd:*)
registerSelectMenu('help:cmd:', async (interaction: StringSelectMenuInteraction) => {
    const commandName = interaction.values[0];
    const command = registry.getCommandByPath(commandName);

    if (!command) {
        await interaction.reply({ content: `${Status.error} Command not found!`, ephemeral: true });
        return;
    }

    // Extract category from custom ID
    const category = interaction.customId.split(':')[2];

    const container = createCommandDetailContainer(commandName, category);

    await interaction.update({
        components: [container],
        flags: [MessageFlags.IsComponentsV2]
    });
});
