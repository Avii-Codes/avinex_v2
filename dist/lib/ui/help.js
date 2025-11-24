"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMainHelpContainer = createMainHelpContainer;
exports.createCategoryContainer = createCategoryContainer;
exports.createCommandDetailContainer = createCommandDetailContainer;
const components_1 = require("../components");
const emoji_1 = require("../emoji");
const helpUtils_1 = require("../helpUtils");
const registry_1 = require("../../plugins/converter/registry");
/**
 * Create the main help container showing all categories
 */
function createMainHelpContainer(client) {
    const container = new components_1.Container()
        .addHeader(`${emoji_1.General.help} Help & Commands`, { divider: true });
    // Bot info section
    container.addText([
        `**Bot Name:** ${client.user?.username}`,
        `**Total Commands:** ${(0, helpUtils_1.getTotalCommandCount)()}`,
        `**Prefix:** \`${process.env.PREFIX || '!'}\``,
    ].join('\n'));
    container.addDivider('large');
    // Categories section
    const categories = (0, helpUtils_1.getCategories)();
    container.addText('### 📂 Command Categories');
    // List categories
    const categoryText = categories.map(cat => {
        const count = (0, helpUtils_1.getCategoryCommandCount)(cat);
        const displayName = (0, helpUtils_1.getCategoryDisplayName)(cat);
        return `**${displayName}:** ${count} command${count !== 1 ? 's' : ''}`;
    }).join('\n');
    container.addText(categoryText);
    container.addDivider();
    // Category select menu
    const categoryOptions = categories.map(cat => ({
        label: (0, helpUtils_1.getCategoryDisplayName)(cat),
        value: cat,
        description: `${(0, helpUtils_1.getCategoryCommandCount)(cat)} commands`,
        emoji: emoji_1.DEFAULT_CATEGORY_EMOJI,
    }));
    container.addActionRow({
        menu: {
            type: 'string',
            customId: 'help:cat',
            placeholder: '📁 Select a category to view commands',
            options: categoryOptions,
        }
    });
    container.addFooter(`${emoji_1.Status.info} Use the menu above to explore commands`);
    return container;
}
/**
 * Create a category view container showing commands in a specific category
 */
function createCategoryContainer(category) {
    const commands = (0, helpUtils_1.getCommandsByCategory)(category);
    // Build category view container
    const container = new components_1.Container()
        .addHeader(`${emoji_1.DEFAULT_CATEGORY_EMOJI} ${(0, helpUtils_1.getCategoryDisplayName)(category)} Commands`, { divider: true });
    // Category description
    container.addText(`Showing ${commands.size} command${commands.size !== 1 ? 's' : ''} in this category.`);
    container.addDivider('large');
    // List commands
    const commandArray = Array.from(commands.entries());
    const commandText = commandArray.map(([name, cmd]) => {
        const displayName = (0, helpUtils_1.formatCommandName)(name);
        return `**/${displayName}** - ${cmd.description || 'No description'}`;
    }).join('\n');
    container.addText(commandText);
    container.addDivider();
    // Command select menu
    const commandOptions = commandArray.map(([name, cmd]) => ({
        label: (0, helpUtils_1.formatCommandName)(name),
        value: name,
        description: cmd.description?.substring(0, 100) || 'No description',
        emoji: '⚡',
    })).slice(0, 25); // Discord limit: 25 options
    if (commandOptions.length > 0) {
        container.addActionRow({
            menu: {
                type: 'string',
                customId: `help:cmd:${category}`,
                placeholder: '⚡ Select a command for details',
                options: commandOptions,
            }
        });
    }
    // Back button
    container.addActionRow({
        buttons: [
            {
                label: 'Back to Main',
                customId: 'help:back:main',
                emoji: '◀️',
                style: 'secondary'
            }
        ]
    });
    return container;
}
/**
 * Create a command detail container showing information about a specific command
 */
function createCommandDetailContainer(commandName, category) {
    const command = registry_1.registry.get(commandName);
    if (!command) {
        // Fallback container if command not found
        const container = new components_1.Container()
            .addHeader(`⚡ Command Not Found`, { divider: true });
        container.addText('The requested command could not be found.');
        return container;
    }
    // Build command detail container
    const container = new components_1.Container()
        .addHeader(`⚡ ${(0, helpUtils_1.formatCommandName)(commandName)}`, { divider: true });
    // Command info
    container.addText(`**Description:** ${command.description || 'No description available'}`);
    // Usage syntax
    if (command.args) {
        container.addText(`**Usage:** \`/${(0, helpUtils_1.formatCommandName)(commandName)} ${command.args}\``);
    }
    else {
        container.addText(`**Usage:** \`/${(0, helpUtils_1.formatCommandName)(commandName)}\``);
    }
    container.addDivider();
    // Additional details section
    const details = [];
    details.push(`**Type:** ${command.type === 'both' ? 'Slash & Prefix' : command.type === 'slash' ? 'Slash Only' : 'Prefix Only'}`);
    if (command.level) {
        details.push(`**Permission:** ${command.level}`);
    }
    if (command.cooldown) {
        details.push(`**Cooldown:** ${command.cooldown}s`);
    }
    if (command.aliases && command.aliases.length > 0) {
        details.push(`**Aliases:** ${command.aliases.map((a) => `\`${a}\``).join(', ')}`);
    }
    // Add details as single text block
    if (details.length > 0) {
        container.addText(details.join('\n'));
    }
    container.addDivider();
    // Navigation buttons
    container.addActionRow({
        buttons: [
            {
                label: 'Back to Category',
                customId: `help:back:cat:${category}`,
                emoji: '◀️',
                style: 'secondary'
            },
            {
                label: 'Back to Main',
                customId: 'help:back:main',
                emoji: '⏪',
                style: 'secondary'
            }
        ]
    });
    return container;
}
//# sourceMappingURL=help.js.map