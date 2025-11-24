"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const emoji_1 = require("../../../../lib/emoji");
const command = {
    name: 'reset-all',
    description: 'Reset ALL command configurations to defaults',
    level: 'ServerOwner',
    async run(ctx) {
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.error} **⚠️ Warning: Reset All Configurations**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText([
            '**This will:**',
            '• Remove all custom command aliases',
            '• Reset all cooldowns to defaults',
            '• Re-enable all disabled commands',
            '• Reset category settings',
            '',
            '**Admin/moderator permissions will NOT be affected**',
            '',
            '**This action cannot be undone!**'
        ].join('\n'))
            .addDivider()
            .addActionRow({
            buttons: [
                {
                    label: 'Yes, Reset Everything',
                    customId: 'config:resetall:confirm',
                    style: 'danger',
                    emoji: '⚠️'
                },
                {
                    label: 'Cancel',
                    customId: 'config:cancel',
                    style: 'secondary',
                    emoji: '❌'
                }
            ]
        });
        await ctx.reply({ components: [container], flags: [discord_js_1.MessageFlags.IsComponentsV2] });
    }
};
exports.default = command;
//# sourceMappingURL=reset-all.js.map