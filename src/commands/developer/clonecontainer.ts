import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags } from 'discord.js';

const command: HybridCommand = {
    name: 'clonecontainer',
    description: 'test container cloning',
    type: 'both',
    level: 'Developer',
    // args: '<arg:string>',

    async run(ctx) {
        const container = new Container()
            .addText('Hello World!');
        const clonedContainer = container.clone();
        clonedContainer.addText('Cloned Container');

        await ctx.reply({
            components: [container, clonedContainer],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
