"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getAllCommands = getAllCommands;
exports.getCommandsByCategory = getCommandsByCategory;
exports.getTotalCommandCount = getTotalCommandCount;
exports.getCategoryCommandCount = getCategoryCommandCount;
exports.capitalize = capitalize;
exports.formatCommandName = formatCommandName;
exports.getCategoryDisplayName = getCategoryDisplayName;
const registry_1 = require("../plugins/converter/registry");
/**
 * Get all unique categories from commands
 */
function getCategories() {
    return registry_1.registry.getCategories();
}
/**
 * Get all commands (simplified for now)
 */
function getAllCommands() {
    const commands = new Map();
    for (const command of registry_1.registry.getAll()) {
        commands.set(command.name, command);
    }
    // Add subcommands from parent commands
    for (const parent of registry_1.registry.getAllParentCommands()) {
        // Direct subcommands
        for (const [name, subcommand] of parent.subcommands) {
            commands.set(`${parent.name}/${name}`, subcommand);
        }
        // Group subcommands
        for (const group of parent.groups.values()) {
            for (const [name, subcommand] of group.subcommands) {
                commands.set(`${parent.name}/${group.name}/${name}`, subcommand);
            }
        }
    }
    return commands;
}
/**
 * Get commands by category
 */
function getCommandsByCategory(category) {
    return registry_1.registry.getCommandsByCategory(category);
}
/**
 * Get total command count
 */
function getTotalCommandCount() {
    return getAllCommands().size;
}
/**
 * Get command count by category
 */
function getCategoryCommandCount(category) {
    return getCommandsByCategory(category).size;
}
/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Format command name for display
 */
function formatCommandName(name) {
    // Remove category prefix if present
    const parts = name.split('/');
    return parts[parts.length - 1];
}
/**
 * Get category display name
 */
function getCategoryDisplayName(category) {
    return capitalize(category);
}
//# sourceMappingURL=helpUtils.js.map