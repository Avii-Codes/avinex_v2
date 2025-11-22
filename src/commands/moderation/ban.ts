import { HybridCommand } from '../../plugins/converter/types';

const command: HybridCommand = {
    name: 'ban',
    description: 'Ban a user from the server',
    type: 'both',
    level: 'Admin',
    permissions: ['BanMembers'], // Keep specific permission as good practice, or rely on Admin level
    args: '<user:user> <reason...?>',
    async run(ctx) {
        const { user, reason } = ctx.args;

        // In a real bot, you would do: ctx.guild.members.ban(user, { reason });

        await ctx.reply({
            content: `🔨 **Banned** ${user}!\nReason: ${reason || 'No reason provided'}`
        });
    }
};

export default command;
