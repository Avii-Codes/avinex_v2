import { HybridCommand } from '../../../plugins/converter/types';
import { Container } from '../../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'avatar',
    description: 'Get a users avatar',
    type: 'both',
    args: '<target:user?>',
    async run(ctx) {
        const user = ctx.args.target || ctx.user;
        const avatarUrl = user.displayAvatarURL({ size: 512 });

        const container = new Container()
            .addText(`## Avatar for ${user.username}`)
            .addSeparator({ spacing: 'small', divider: true })
            .addMedia([
                { url: avatarUrl, description: `${user.username}'s avatar` }
            ])
            .addActionRow({
                buttons: [
                    {
                        label: 'Download',
                        url: avatarUrl,
                        emoji: '⬇️'
                    }
                ]
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
