import { HybridCommand, SubCommandGroup, RootCommandCollection } from './types';
import { configManager } from '../../utils/config';
import { log } from '../../utils/logger';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

export class CommandRegistry {
    private commands = new Map<string, HybridCommand>();
    private aliases = new Map<string, string>(); // alias -> canonicalName
    private subcommands = new Map<string, RootCommandCollection>();
    private fileFingerprints = new Map<string, string>(); // fingerprint -> canonicalName
    private commandCategories = new Map<string, string>(); // commandName -> category
    private groupCategories = new Map<string, string>(); // groupName -> category

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
            let root = this.subcommands.get(parentGroup);

            // Check if parentGroup is actually "Root/Group"
            if (parentGroup.includes('/')) {
                const [rootName, groupName] = parentGroup.split('/');
                root = this.subcommands.get(rootName);

                if (!root) {
                    log.error(`Root command ${rootName} not found for ${cmd.name}`);
                    return;
                }

                let group = root.groups.get(groupName);
                if (!group) {
                    log.error(`Subcommand group ${groupName} not found in ${rootName} for ${cmd.name}`);
                    return;
                }

                if (group.subcommands.has(cmd.name)) {
                    log.error(`[FATAL] Subcommand collision: ${rootName}/${groupName}/${cmd.name} is already registered.`);
                    process.exit(1);
                }
                group.subcommands.set(cmd.name, cmd);
                // Store category for the root if not already set (should be)
                if (!this.groupCategories.has(rootName)) {
                    this.groupCategories.set(rootName, category);
                }

            } else {
                // Direct subcommand of Root
                if (!root) {
                    log.error(`Root command ${parentGroup} not found for ${cmd.name}`);
                    return;
                }
                if (root.subcommands.has(cmd.name)) {
                    log.error(`[FATAL] Subcommand collision: ${parentGroup} ${cmd.name} is already registered.`);
                    process.exit(1);
                }
                root.subcommands.set(cmd.name, cmd);
                // Store category for the root if not already set
                if (!this.groupCategories.has(parentGroup)) {
                    this.groupCategories.set(parentGroup, category);
                }
            }
        } else {
            if (this.commands.has(cmd.name)) {
                log.error(`[FATAL] Command collision: ${cmd.name} is already registered.`);
                process.exit(1);
            }
            this.commands.set(cmd.name, cmd);
            // Store category for this command
            this.commandCategories.set(cmd.name, category);

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

    public registerRoot(root: RootCommandCollection) {
        this.subcommands.set(root.name, root);
    }

    public registerGroup(rootName: string, group: SubCommandGroup) {
        const root = this.subcommands.get(rootName);
        if (root) {
            root.groups.set(group.name, group);
        } else {
            log.error(`Cannot register group ${group.name}: Root ${rootName} not found.`);
        }
    }

    public get(name: string): HybridCommand | undefined {
        return this.commands.get(name);
    }

    public getByAlias(alias: string): HybridCommand | undefined {
        const canonical = this.aliases.get(alias);
        if (canonical) return this.commands.get(canonical);
        return undefined;
    }

    public getRoot(name: string): RootCommandCollection | undefined {
        return this.subcommands.get(name);
    }

    public getCommandByPath(path: string): HybridCommand | undefined {
        // Try top-level first
        if (this.commands.has(path)) return this.commands.get(path);

        // Try parsing path: root/group/sub or root/sub
        const parts = path.split('/');
        if (parts.length === 1) return undefined;

        const rootName = parts[0];
        const root = this.subcommands.get(rootName);
        if (!root) return undefined;

        if (parts.length === 2) {
            // root/sub
            return root.subcommands.get(parts[1]);
        } else if (parts.length === 3) {
            // root/group/sub
            const group = root.groups.get(parts[1]);
            return group?.subcommands.get(parts[2]);
        }

        return undefined;
    }

    public getAll(): IterableIterator<HybridCommand> {
        return this.commands.values();
    }

    public getAllRoots(): IterableIterator<RootCommandCollection> {
        return this.subcommands.values();
    }

    public getCategory(commandName: string): string | undefined {
        return this.commandCategories.get(commandName);
    }

    public getGroupCategory(groupName: string): string | undefined {
        return this.groupCategories.get(groupName);
    }

    public getCommandsByCategory(category: string): Map<string, HybridCommand> {
        const result = new Map<string, HybridCommand>();

        // Add top-level commands in this category
        for (const [name, cmd] of this.commands.entries()) {
            if (this.commandCategories.get(name) === category) {
                result.set(name, cmd);
            }
        }

        // Add subcommands from roots in this category
        for (const root of this.subcommands.values()) {
            if (this.groupCategories.get(root.name) === category) {
                // Direct subcommands
                for (const [name, subcmd] of root.subcommands) {
                    result.set(`${root.name}/${name}`, subcmd);
                }
                // Nested subcommands
                for (const group of root.groups.values()) {
                    for (const [name, subcmd] of group.subcommands) {
                        result.set(`${root.name}/${group.name}/${name}`, subcmd);
                    }
                }
            }
        }

        return result;
    }

    public getCategories(): string[] {
        const categories = new Set<string>();

        // Collect categories from commands
        for (const category of this.commandCategories.values()) {
            categories.add(category);
        }

        // Collect categories from groups
        for (const category of this.groupCategories.values()) {
            categories.add(category);
        }

        return Array.from(categories).sort();
    }

    public getFlattenedCommands(): Map<string, HybridCommand> {
        const commands = new Map<string, HybridCommand>();

        // Add top-level commands
        for (const command of this.commands.values()) {
            commands.set(command.name, command);
        }

        // Add subcommands from roots
        for (const root of this.subcommands.values()) {
            // Direct subcommands: root/sub
            for (const [name, subcommand] of root.subcommands) {
                commands.set(`${root.name}/${name}`, subcommand);
            }
            // Nested subcommands: root/group/sub
            for (const group of root.groups.values()) {
                for (const [name, subcommand] of group.subcommands) {
                    commands.set(`${root.name}/${group.name}/${name}`, subcommand);
                }
            }
        }

        return commands;
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
