import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { log } from './logger';

interface CommandConfig {
    enabled: boolean;
    aliases: string[];
    cooldown: number;
}

interface CategoryConfig {
    enabled: boolean;
    commands: Record<string, CommandConfig>;
}

interface RootConfig {
    categories: Record<string, CategoryConfig>;
}

export class ConfigManager {
    private path: string;
    private config: RootConfig;
    private dirty: boolean = false;

    constructor() {
        this.path = join(process.cwd(), 'commands.json');
        this.config = this.load();
    }

    private load(): RootConfig {
        if (existsSync(this.path)) {
            try {
                const content = readFileSync(this.path, 'utf-8');
                if (!content.trim()) {
                    return { categories: {} };
                }
                return JSON.parse(content);
            } catch (e) {
                log.warn('commands.json was invalid or empty. Creating a new one...');
                return { categories: {} };
            }
        }
        return { categories: {} };
    }

    public getCategory(name: string): CategoryConfig {
        if (!this.config.categories[name]) {
            this.config.categories[name] = {
                enabled: true,
                commands: {}
            };
            this.dirty = true;
        }
        return this.config.categories[name];
    }

    public getCommand(categoryName: string, commandName: string, defaults: Partial<CommandConfig> = {}): CommandConfig {
        const category = this.getCategory(categoryName);

        if (!category.commands[commandName]) {
            category.commands[commandName] = {
                enabled: true,
                aliases: defaults.aliases || [],
                cooldown: defaults.cooldown || 0
            };
            this.dirty = true;
        }

        return category.commands[commandName];
    }

    public save() {
        if (this.dirty) {
            writeFileSync(this.path, JSON.stringify(this.config, null, 2));
            this.dirty = false;
            log.verbose('Updated commands.json with new commands/categories.');
        }
    }
}

export const configManager = new ConfigManager();
