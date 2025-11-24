"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const components_1 = require("../../../../lib/components");
const discord_js_1 = require("discord.js");
const emoji_1 = require("../../../../lib/emoji");
const registry_1 = require("../../../../plugins/converter/registry");
const command = {
    name: 'disable',
    description: 'Disable an entire category',
    args: '<category:string>',
    level: 'Admin',
    async run(ctx) {
        const { category } = ctx.args;
        const commands = registry_1.registry.getCommandsByCategory(category);
        const count = commands.size;
        // Show confirmation
        const container = new components_1.Container()
            .addText(`${emoji_1.Status.error} **Confirm Category Disable**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`This will disable **${count} commands** in the \`${category}\` category.`)
            .addDivider()
            .addActionRow({
            buttons: [
                {
                    label: 'Confirm',
                    customId: `config:category:disable:${category}`,
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
//# sourceMappingURL=disable.js.map