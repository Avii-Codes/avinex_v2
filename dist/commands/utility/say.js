"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command = {
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
exports.default = command;
//# sourceMappingURL=say.js.map