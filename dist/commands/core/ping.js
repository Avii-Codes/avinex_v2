"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = {
    name: 'ping',
    description: 'Replies with Pong!',
    type: 'both',
    async run(ctx) {
        await ctx.reply(`Pong! 🏓 (${ctx.client.ws.ping}ms)`);
    }
};
exports.default = command;
//# sourceMappingURL=ping.js.map