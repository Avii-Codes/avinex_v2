"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guildConfigManager = exports.GuildConfigManager = void 0;
const Guild_1 = require("../database/models/Guild");
const config_1 = require("./config");
const registry_1 = require("../plugins/converter/registry");
class GuildConfigManager {
    /**
     * Get command config with fallback chain:
     * Guild Command → Guild Category → Global → Defaults
     */
    async getCommandConfig(guildId, commandName) {
        const guild = await Guild_1.GuildModel.findOne({ guildId });
        // 1. Guild command override
        const commandConfig = guild?.commandConfig;
        const guildCmdConfig = commandConfig?.get(commandName);
        if (guildCmdConfig) {
            return {
                enabled: guildCmdConfig.enabled,
                aliases: guildCmdConfig.aliases || [],
                cooldown: guildCmdConfig.cooldown || 0
            };
        }
        // 2. Guild category override
        const category = registry_1.registry.getCategory(commandName);
        if (category) {
            const categoryConfig = guild?.categoryConfig;
            const guildCatConfig = categoryConfig?.get(category);
            if (guildCatConfig && !guildCatConfig.enabled) {
                const globalConfig = config_1.configManager.getCommand(category, commandName);
                return {
                    enabled: false,
                    aliases: globalConfig.aliases,
                    cooldown: globalConfig.cooldown
                };
            }
        }
        // 3. Global config
        const globalConfig = config_1.configManager.getCommand(category || '', commandName);
        return {
            enabled: globalConfig.enabled,
            aliases: globalConfig.aliases,
            cooldown: globalConfig.cooldown
        };
    }
    async setCommandConfig(guildId, commandName, config) {
        await Guild_1.GuildModel.findOneAndUpdate({ guildId }, { $set: { [`commandConfig.${commandName}`]: config } }, { upsert: true });
    }
    async setCategoryConfig(guildId, categoryName, enabled) {
        await Guild_1.GuildModel.findOneAndUpdate({ guildId }, { $set: { [`categoryConfig.${categoryName}`]: { enabled } } }, { upsert: true });
    }
    async resetCommandConfig(guildId, commandName) {
        await Guild_1.GuildModel.findOneAndUpdate({ guildId }, { $unset: { [`commandConfig.${commandName}`]: "" } });
    }
    async resetAllConfigs(guildId) {
        await Guild_1.GuildModel.findOneAndUpdate({ guildId }, { $unset: { commandConfig: "", categoryConfig: "" } });
    }
    async getCustomizedCommands(guildId) {
        const guild = await Guild_1.GuildModel.findOne({ guildId });
        const commandConfig = guild?.commandConfig;
        if (!commandConfig)
            return new Map();
        // Convert to proper Map if needed
        if (commandConfig instanceof Map) {
            return commandConfig;
        }
        return new Map();
    }
}
exports.GuildConfigManager = GuildConfigManager;
exports.guildConfigManager = new GuildConfigManager();
//# sourceMappingURL=guildConfigManager.js.map