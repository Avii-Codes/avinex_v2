import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'info',
    description: 'Get info about a user',
    type: 'both',
    args: '<target:user?>',
    async run(ctx) {
        const user = ctx.args.target || ctx.user;

        const container = new Container()
            .addText(`## User Info: ${user.username}`)
            .addSeparator({ spacing: 'small', divider: true })
            .addSection({
                texts: [
                    `**ID:** ${user.id}`,
                    `**Bot:** ${user.bot ? 'Yes' : 'No'}`,
                    `**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`
                ],
                accessory: {
                    type: 'thumbnail',
                    url: user.displayAvatarURL()
                }
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
