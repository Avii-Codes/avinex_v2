"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const logger_1 = require("../utils/logger");
const CONFIG_PATH = (0, path_1.join)(process.cwd(), 'commands.json');
const COMMANDS_DIR = (0, path_1.join)(process.cwd(), 'src', 'commands');
// 1. Load existing config
let config = { categories: {} };
if ((0, fs_1.existsSync)(CONFIG_PATH)) {
    try {
        const content = (0, fs_1.readFileSync)(CONFIG_PATH, 'utf-8');
        if (content.trim()) {
            config = JSON.parse(content);
        }
    }
    catch (e) {
        logger_1.log.warn('Could not read commands.json, starting fresh.');
    }
}
// 2. Scan Codebase
const foundCommands = new Map();
const foundCategories = new Set();
function scanDir(dir, category) {
    const files = (0, fs_1.readdirSync)(dir);
    for (const file of files) {
        const path = (0, path_1.join)(dir, file);
        const stat = (0, fs_1.statSync)(path);
        if (stat.isDirectory()) {
            // Subcommand group (e.g. 'user')
            scanDir(path, category);
        }
        else if (file.endsWith('.ts') || file.endsWith('.js')) {
            // It's a command file. We need to require it to get the name? 
            // Or just use filename? The bot uses the 'name' export.
            // For safety in this script, let's try to infer from filename first, 
            // or just require it if we can. Requiring might be heavy.
            // Let's assume filename = command name for simplicity in sync, 
            // OR try to require it.
            try {
                // We can't easily require .ts files in a script without ts-node registration issues sometimes,
                // but since we are running with ts-node, it should be fine.
                const cmdModule = require(path);
                const cmd = cmdModule.default || cmdModule;
                if (cmd && cmd.name) {
                    foundCommands.set(`${category}:${cmd.name}`, { category, name: cmd.name });
                    foundCategories.add(category);
                }
            }
            catch (e) {
                logger_1.log.verbose(`Could not load ${file}`, e);
            }
        }
    }
}
// Scan Root
if ((0, fs_1.existsSync)(COMMANDS_DIR)) {
    const rootFiles = (0, fs_1.readdirSync)(COMMANDS_DIR);
    for (const file of rootFiles) {
        const path = (0, path_1.join)(COMMANDS_DIR, file);
        const stat = (0, fs_1.statSync)(path);
        if (stat.isDirectory()) {
            // Category folder
            scanDir(path, file);
        }
        else if (file.endsWith('.ts') || file.endsWith('.js')) {
            // Root command
            try {
                const cmdModule = require(path);
                const cmd = cmdModule.default || cmdModule;
                if (cmd && cmd.name) {
                    foundCommands.set(`General:${cmd.name}`, { category: 'General', name: cmd.name });
                    foundCategories.add('General');
                }
            }
            catch (e) { }
        }
    }
}
logger_1.log.info(`Found ${foundCommands.size} commands in code.`);
// 3. Sync: Remove Old
let removedCount = 0;
for (const catName in config.categories) {
    const cat = config.categories[catName];
    // Check if category still exists (if it has any commands found in code)
    // Actually, we should check if the category folder exists? 
    // Let's just check if we found any commands for this category.
    if (!foundCategories.has(catName) && catName !== 'General') {
        // Keep General if it has stuff? 
        // If we found NO commands for this category, we can probably remove it 
        // OR keep it if user wants. Let's remove empty categories to be clean.
        delete config.categories[catName];
        logger_1.log.info(`Removed category: ${catName}`);
        continue;
    }
    for (const cmdName in cat.commands) {
        if (!foundCommands.has(`${catName}:${cmdName}`)) {
            delete cat.commands[cmdName];
            removedCount++;
            logger_1.log.info(`Removed command: ${cmdName} from ${catName}`);
        }
    }
}
// 4. Sync: Add New
let addedCount = 0;
foundCommands.forEach(({ category, name }) => {
    if (!config.categories[category]) {
        config.categories[category] = { enabled: true, commands: {} };
    }
    if (!config.categories[category].commands[name]) {
        config.categories[category].commands[name] = {
            enabled: true,
            aliases: [],
            cooldown: 0
        };
        addedCount++;
        logger_1.log.success(`Added command: ${name} to ${category}`);
    }
});
// 5. Save
(0, fs_1.writeFileSync)(CONFIG_PATH, JSON.stringify(config, null, 2));
logger_1.log.success(`Sync Complete. Added: ${addedCount}, Removed: ${removedCount}`);
