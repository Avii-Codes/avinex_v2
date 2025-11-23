import { HybridCommand } from '../../plugins/converter/types';

const command: HybridCommand = {
    name: 'say',
    description: 'make the bot say something',
    type: 'both',
    level: 'User',
    args: '<arg:string>',

    async run(ctx) {
        const { arg } = ctx.args;
        await ctx.reply(arg);
    }
};

export default command;
