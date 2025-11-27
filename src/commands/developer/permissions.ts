import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { Container } from '../../lib/components';

const command: HybridCommand = {
    name: 'permissions',
    description: 'Test granular permission controls',
    run: async (ctx) => {
        const container = new Container()
            .addText('🔐 **Permission Test Dashboard**\n\nClick buttons to test different permission levels:')
            .addActionRow({
                buttons: [
                    {
                        customId: ctx.createId('everyone'),
                        label: '👥 Everyone',
                        style: 'primary'
                    },
                    {
                        customId: ctx.createId('admin'),
                        label: '🛡️ Admin Only',
                        style: 'secondary'
                    }
                ]
            })
            .addActionRow({
                buttons: [
                    {
                        customId: ctx.createId('owner'),
                        label: '👑 Owner Only',
                        style: 'danger'
                    },
                    {
                        customId: ctx.createId('cooldown'),
                        label: '⏱️ Cooldown (10s)',
                        style: 'success'
                    }
                ]
            });

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    },

    components: {
        everyone: async (ctx: ComponentContext) => {
            await ctx.interaction.reply({
                content: '✅ **Everyone Access**\n\nThis button can be clicked by anyone!',
                ephemeral: true
            });
        },

        admin: {
            permissions: [PermissionFlagsBits.Administrator],
            run: async (ctx: ComponentContext) => {
                await ctx.interaction.reply({
                    content: '🛡️ **Admin Access**\n\nYou have administrator permissions!',
                    ephemeral: true
                });
            }
        },

        owner: {
            ownerOnly: true,
            run: async (ctx: ComponentContext) => {
                await ctx.interaction.reply({
                    content: '👑 **Owner Access**\n\nYou are the bot owner!',
                    ephemeral: true
                });
            }
        },

        cooldown: {
            cooldown: 10,
            run: async (ctx: ComponentContext) => {
                await ctx.interaction.reply({
                    content: '⏱️ **Cooldown Active**\n\nYou can use this button again in 10 seconds!',
                    ephemeral: true
                });
            }
        }
    }
};

export default command;
