import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'clickgame',
    description: 'Interactive click counter game with automatic cleanup',
    run: async (ctx) => {
        const container = new Container()
            .addText('🎮 **Click Counter Game**\n\n**Score:** 0\n*TTL: 3 minutes*')
            .addActionRow({
                buttons: [
                    {
                        customId: ctx.createId('click', { score: 0, highScore: 0 }, 180),
                        label: '🎯 Click Me!',
                        style: 'primary'
                    },
                    {
                        customId: ctx.createId('reset', { score: 0, highScore: 0 }, 180),
                        label: '🔄 Reset',
                        style: 'secondary'
                    }
                ]
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },

    components: {
        click: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Game expired (3 minutes)',
                    ephemeral: true
                });
            }

            const newScore = ctx.state.score + 1;
            const highScore = Math.max(newScore, ctx.state.highScore);
            const emoji = newScore >= 10 ? '🔥' : newScore >= 5 ? '⭐' : '🎯';

            const container = new Container()
                .addText(`🎮 **Click Counter Game**\n\n**Score:** ${newScore} ${emoji}\n**High Score:** ${highScore}\n*TTL: 3 minutes*`)
                .addActionRow({
                    buttons: [
                        {
                            customId: ctx.createId('click', { score: newScore, highScore }, 180),
                            label: `🎯 Click Me! (${newScore})`,
                            style: newScore >= 10 ? 'success' : 'primary'
                        },
                        {
                            customId: ctx.createId('reset', { score: newScore, highScore }, 180),
                            label: '🔄 Reset',
                            style: 'secondary'
                        }
                    ]
                });

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });
        },

        reset: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Game expired (3 minutes)',
                    ephemeral: true
                });
            }

            const { highScore } = ctx.state;

            const container = new Container()
                .addText(`🎮 **Click Counter Game**\n\n**Score:** 0\n**High Score:** ${highScore}\n*TTL: 3 minutes*`)
                .addActionRow({
                    buttons: [
                        {
                            customId: ctx.createId('click', { score: 0, highScore }, 180),
                            label: '🎯 Click Me!',
                            style: 'primary'
                        },
                        {
                            customId: ctx.createId('reset', { score: 0, highScore }, 180),
                            label: '🔄 Reset',
                            style: 'secondary'
                        }
                    ]
                });

            await ctx.interaction.update({
                components: [container],
                flags: [MessageFlags.IsComponentsV2]
            });
        }
    }
};

export default command;
