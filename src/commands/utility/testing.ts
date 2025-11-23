import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags } from 'discord.js';
const command: HybridCommand = {
    name: 'test',
    description: 'testing things out',
    type: 'both',
    level: 'Developer',
    args: '<thumbnail:string><image:string>',

    async run(ctx) {
        const container = new Container()
            .addText('## User Stats')
            .addSeparator({ spacing: 'small', divider: true })
            .addSection({
                texts: ['**Username:** User123', '**Rank:** #1'],
                accessory: {
                    type: 'thumbnail',
                    url: ctx.args.thumbnail
                }
            })
            .addSeparator()
            .addSection({
                texts: ['View full profile on website'],
                accessory: {
                    type: 'button',
                    label: 'View Profile',
                    url: ctx.args.image
                }
            })
        container.addMedia([
            { url: ctx.args.image, description: 'A remote image' }
        ]);
        // const { arg } = ctx.args;
        await ctx.reply({
            content: '',
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
