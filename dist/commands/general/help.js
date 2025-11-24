"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const help_1 = require("../../lib/ui/help");
const command = {
    name: 'help',
    description: 'View all available commands and get help',
    type: 'both',
    args: '[command:string?]',
    async run(ctx) {
        // If specific command requested, show command details (TODO)
        if (ctx.args.command) {
            await ctx.reply({ content: 'Command-specific help coming soon!' });
            return;
        }
        const container = (0, help_1.createMainHelpContainer)(ctx.client);
        await ctx.reply({
            components: [container],
            flags: [discord_js_1.MessageFlags.IsComponentsV2]
        });
    }
};
exports.default = command;
//# sourceMappingURL=help.js.map