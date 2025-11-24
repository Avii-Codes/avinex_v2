export interface CommandConfig {
    enabled: boolean;
    aliases: string[];
    cooldown: number;
}
export declare class GuildConfigManager {
    /**
     * Get command config with fallback chain:
     * Guild Command → Guild Category → Global → Defaults
     */
    getCommandConfig(guildId: string, commandName: string): Promise<CommandConfig>;
    setCommandConfig(guildId: string, commandName: string, config: Partial<CommandConfig>): Promise<void>;
    setCategoryConfig(guildId: string, categoryName: string, enabled: boolean): Promise<void>;
    resetCommandConfig(guildId: string, commandName: string): Promise<void>;
    resetAllConfigs(guildId: string): Promise<void>;
    getCustomizedCommands(guildId: string): Promise<Map<string, CommandConfig>>;
}
export declare const guildConfigManager: GuildConfigManager;
//# sourceMappingURL=guildConfigManager.d.ts.map