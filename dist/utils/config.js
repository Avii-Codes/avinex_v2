"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = exports.ConfigManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("./logger");
class ConfigManager {
    constructor() {
        this.dirty = false;
        this.path = (0, path_1.join)(process.cwd(), 'commands.json');
        this.config = this.load();
    }
    load() {
        if ((0, fs_1.existsSync)(this.path)) {
            try {
                const content = (0, fs_1.readFileSync)(this.path, 'utf-8');
                if (!content.trim()) {
                    return { categories: {} };
                }
                return JSON.parse(content);
            }
            catch (e) {
                logger_1.log.warn('commands.json was invalid or empty. Creating a new one...');
                return { categories: {} };
            }
        }
        return { categories: {} };
    }
    getCategory(name) {
        if (!this.config.categories[name]) {
            this.config.categories[name] = {
                enabled: true,
                commands: {}
            };
            this.dirty = true;
        }
        return this.config.categories[name];
    }
    getCommand(categoryName, commandName, defaults = {}) {
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
    save() {
        if (this.dirty) {
            (0, fs_1.writeFileSync)(this.path, JSON.stringify(this.config, null, 2));
            this.dirty = false;
            logger_1.log.verbose('Updated commands.json with new commands/categories.');
        }
    }
}
exports.ConfigManager = ConfigManager;
exports.configManager = new ConfigManager();
