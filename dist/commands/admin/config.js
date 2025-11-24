"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../lib/components");
const discord_js_1 = require("discord.js");
const command = {
    name: 'config',
    description: 'Manage guild-specific command configurations and permissions',
    level: 'Admin',
    type: 'slash', // Subcommands only work with slash commands
    async run(ctx) {
        // This is the help/info for the config command if run without subcommands
        const container = new components_1.Container()
            .addText('## ⚙️ Server Configuration')
            .addSeparator({ spacing: 'small', divider: true })
            .addText([
            '**Available Subcommands:**',
            '',
            '**Set Configuration:**',
            '• `/config set enable <command>` - Enable a command',
            '• `/config set disable <command>` - Disable a command',
            '• `/config set aliases <command> <aliases>` - Set custom aliases (comma-separated)',
            '• `/config set cooldown <command> <seconds>` - Set cooldown',
            '• `/config set admin <role|user> <id>` - Add admin role/user (Owner only)',
            '• `/config set moderator <role|user> <id>` - Add moderator role/user',
            '',
            '**Remove Configuration:**',
            '• `/config remove aliases <command> [aliases]` - Remove specific or all aliases',
            '• `/config remove cooldown <command>` - Reset cooldown to default',
            '• `/config remove admin <role|user> <id>` - Remove admin role/user (Owner only)',
            '• `/config remove moderator <role|user> <id>` - Remove moderator role/user',
            '• `/config remove reset <command>` - Reset command to defaults',
            '• `/config remove reset-all` - Reset ALL configurations (preserves permissions)',
            '',
            '**Category Controls:**',
            '• `/config category enable <category>` - Enable all commands in category',
            '• `/config category disable <category>` - Disable all commands in category',
            '',
            '**View Information:**',
            '• `/config view show <command>` - View command configuration',
            '• `/config view list` - List all customized commands'
        ].join('\n'));
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=config.js.map