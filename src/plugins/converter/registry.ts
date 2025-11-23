import { HybridCommand, SubCommandGroup } from './types';
import { configManager } from '../../utils/config';
import { log } from '../../utils/logger';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

export class CommandRegistry {
    private commands = new Map<string, HybridCommand>();
    private aliases = new Map<string, string>(); // alias -> canonicalName
    private subcommands = new Map<string, SubCommandGroup>();
    private fileFingerprints = new Map<string, string>(); // fingerprint -> canonicalName

    public register(cmd: HybridCommand, filePath: string, category: string, parentGroup?: string) {
        const fingerprint = this.calculateFingerprint(filePath);

        // Check if this file was known by another name (renaming support)
        const existingName = this.fileFingerprints.get(fingerprint);
        if (existingName && existingName !== cmd.name) {
            log.warn(`Detected rename: ${existingName} -> ${cmd.name}. Updating config...`);
            // In a real scenario, we might auto-migrate config here.
            // For now, we just log it, but the configManager needs to handle it.
        }

        this.fileFingerprints.set(fingerprint, cmd.name);

        // Get Config
        const cmdConfig = configManager.getCommand(category, cmd.name, {
            aliases: cmd.aliases,
            cooldown: cmd.cooldown,
            fingerprint: fingerprint
        });

        if (!cmdConfig.enabled) {
            log.verbose(`Skipping disabled command: ${cmd.name}`);
            return;
        }

        // Apply Config
        cmd.aliases = cmdConfig.aliases;
        cmd.cooldown = cmdConfig.cooldown;

        if (parentGroup) {
            let group = this.subcommands.get(parentGroup);
            if (!group) {
                // Should have been created by the loader, but safety check
                log.error(`Parent group ${parentGroup} not found for ${cmd.name}`);
                return;
            }
            if (group.subcommands.has(cmd.name)) {
                log.error(`[FATAL] Subcommand collision: ${parentGroup} ${cmd.name} is already registered.`);
                process.exit(1);
            }
            group.subcommands.set(cmd.name, cmd);
        } else {
            if (this.commands.has(cmd.name)) {
                log.error(`[FATAL] Command collision: ${cmd.name} is already registered.`);
                process.exit(1);
            }
            this.commands.set(cmd.name, cmd);

            // Register Aliases
            if (cmd.aliases) {
                for (const alias of cmd.aliases) {
                    if (this.aliases.has(alias)) {
                        log.error(`[FATAL] Alias collision: "${alias}" is already used by ${this.aliases.get(alias)}.`);
                        process.exit(1);
                    }
                    if (this.commands.has(alias)) {
                        log.error(`[FATAL] Alias collision: "${alias}" is already a command name.`);
                        process.exit(1);
                    }
                    this.aliases.set(alias, cmd.name);
                }
            }
        }
    }

    public registerGroup(group: SubCommandGroup) {
        this.subcommands.set(group.name, group);
    }

    public get(name: string): HybridCommand | undefined {
        return this.commands.get(name);
    }

    public getByAlias(alias: string): HybridCommand | undefined {
        const canonical = this.aliases.get(alias);
        if (canonical) return this.commands.get(canonical);
        return undefined;
    }

    public getGroup(name: string): SubCommandGroup | undefined {
        return this.subcommands.get(name);
    }

    public getAll(): IterableIterator<HybridCommand> {
        return this.commands.values();
    }

    public getAllGroups(): IterableIterator<SubCommandGroup> {
        return this.subcommands.values();
    }

    private calculateFingerprint(filePath: string): string {
        try {
            const content = readFileSync(filePath, 'utf-8');
            // Normalize line endings to LF to ensure consistent hash across OS
            const normalized = content.replace(/\r\n/g, '\n');
            return createHash('md5').update(normalized).digest('hex');
        } catch (e) {
            return '';
        }
    }
}

export const registry = new CommandRegistry();
