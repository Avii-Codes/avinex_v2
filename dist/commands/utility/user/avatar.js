"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = {
    name: 'avatar',
    description: 'Get a users avatar',
    type: 'both',
    args: '<target:user?>',
    async run(ctx) {
        const user = ctx.args.target || ctx.user;
        await ctx.reply({
            embeds: [{
                    title: `Avatar for ${user.username}`,
                    image: { url: user.displayAvatarURL({ size: 512 }) }, // Cast to any to avoid literal type issues if that's the cause
                    color: 0x0099ff
                }]
        });
    }
};
exports.default = command;
