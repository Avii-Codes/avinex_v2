import { HybridCommand } from '../../plugins/converter/types';

const command: HybridCommand = {
    name: 'ping',
    description: 'Replies with Pong!',
    type: 'both',
    async run(ctx) {
        await ctx.reply(`Pong! 🏓 (${ctx.client.ws.ping}ms)`);
    }
};

export default command;
