interface CommandConfig {
    enabled: boolean;
    aliases: string[];
    cooldown: number;
    fingerprint?: string;
}
interface CategoryConfig {
    enabled: boolean;
    commands: Record<string, CommandConfig>;
}
export declare class ConfigManager {
    private path;
    private config;
    private dirty;
    constructor();
    private load;
    getCategory(name: string): CategoryConfig;
    getCommand(categoryName: string, commandName: string, defaults?: Partial<CommandConfig>): CommandConfig;
    save(): void;
}
export declare const configManager: ConfigManager;
export {};
//# sourceMappingURL=config.d.ts.map