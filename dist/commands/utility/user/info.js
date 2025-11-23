"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = {
    name: 'info',
    description: 'Get info about a user',
    type: 'both',
    args: '<target:user?>',
    async run(ctx) {
        const user = ctx.args.target || ctx.user;
        await ctx.reply({
            embeds: [{
                    title: `User Info: ${user.username}`,
                    thumbnail: { url: user.displayAvatarURL() },
                    fields: [
                        { name: 'ID', value: user.id, inline: true },
                        { name: 'Bot?', value: user.bot ? 'Yes' : 'No', inline: true }
                    ],
                    color: 0x0099ff
                }]
        });
    }
};
exports.default = command;
//# sourceMappingURL=info.js.map