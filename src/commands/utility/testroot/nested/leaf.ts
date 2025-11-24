import { HybridCommand } from '../../../../plugins/converter/types';

const command: HybridCommand = {
    name: 'leaf',
    description: 'A nested subcommand leaf',
    type: 'both',
    async run(ctx) {
        await ctx.reply('🌿 Found the leaf command!');
    }
};

export default command;
