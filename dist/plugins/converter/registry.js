"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.CommandRegistry = void 0;
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
class CommandRegistry {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map(); // alias -> canonicalName
        this.subcommands = new Map();
        this.fileFingerprints = new Map(); // fingerprint -> canonicalName
    }
    register(cmd, filePath, category, parentGroup) {
        const fingerprint = this.calculateFingerprint(filePath);
        // Check if this file was known by another name (renaming support)
        const existingName = this.fileFingerprints.get(fingerprint);
        if (existingName && existingName !== cmd.name) {
            logger_1.log.warn(`Detected rename: ${existingName} -> ${cmd.name}. Updating config...`);
            // In a real scenario, we might auto-migrate config here.
            // For now, we just log it, but the configManager needs to handle it.
        }
        this.fileFingerprints.set(fingerprint, cmd.name);
        // Get Config
        const cmdConfig = config_1.configManager.getCommand(category, cmd.name, {
            aliases: cmd.aliases,
            cooldown: cmd.cooldown,
            fingerprint: fingerprint
        });
        if (!cmdConfig.enabled) {
            logger_1.log.verbose(`Skipping disabled command: ${cmd.name}`);
            return;
        }
        // Apply Config
        cmd.aliases = cmdConfig.aliases;
        cmd.cooldown = cmdConfig.cooldown;
        if (parentGroup) {
            let group = this.subcommands.get(parentGroup);
            if (!group) {
                // Should have been created by the loader, but safety check
                logger_1.log.error(`Parent group ${parentGroup} not found for ${cmd.name}`);
                return;
            }
            if (group.subcommands.has(cmd.name)) {
                logger_1.log.error(`[FATAL] Subcommand collision: ${parentGroup} ${cmd.name} is already registered.`);
                process.exit(1);
            }
            group.subcommands.set(cmd.name, cmd);
        }
        else {
            if (this.commands.has(cmd.name)) {
                logger_1.log.error(`[FATAL] Command collision: ${cmd.name} is already registered.`);
                process.exit(1);
            }
            this.commands.set(cmd.name, cmd);
            // Register Aliases
            if (cmd.aliases) {
                for (const alias of cmd.aliases) {
                    if (this.aliases.has(alias)) {
                        logger_1.log.error(`[FATAL] Alias collision: "${alias}" is already used by ${this.aliases.get(alias)}.`);
                        process.exit(1);
                    }
                    if (this.commands.has(alias)) {
                        logger_1.log.error(`[FATAL] Alias collision: "${alias}" is already a command name.`);
                        process.exit(1);
                    }
                    this.aliases.set(alias, cmd.name);
                }
            }
        }
    }
    registerGroup(group) {
        this.subcommands.set(group.name, group);
    }
    get(name) {
        return this.commands.get(name);
    }
    getByAlias(alias) {
        const canonical = this.aliases.get(alias);
        if (canonical)
            return this.commands.get(canonical);
        return undefined;
    }
    getGroup(name) {
        return this.subcommands.get(name);
    }
    getAll() {
        return this.commands.values();
    }
    getAllGroups() {
        return this.subcommands.values();
    }
    calculateFingerprint(filePath) {
        try {
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            // Normalize line endings to LF to ensure consistent hash across OS
            const normalized = content.replace(/\r\n/g, '\n');
            return (0, crypto_1.createHash)('md5').update(normalized).digest('hex');
        }
        catch (e) {
            return '';
        }
    }
}
exports.CommandRegistry = CommandRegistry;
exports.registry = new CommandRegistry();
//# sourceMappingURL=registry.js.map