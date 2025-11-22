import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { log } from '../utils/logger';

// Types (Simplified for script)
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

const CONFIG_PATH = join(process.cwd(), 'commands.json');
const COMMANDS_DIR = join(process.cwd(), 'src', 'commands');

// 1. Load existing config
let config: RootConfig = { categories: {} };
if (existsSync(CONFIG_PATH)) {
    try {
        const content = readFileSync(CONFIG_PATH, 'utf-8');
        if (content.trim()) {
            config = JSON.parse(content);
        }
    } catch (e) {
        log.warn('Could not read commands.json, starting fresh.');
    }
}

// 2. Scan Codebase
const foundCommands = new Map<string, { category: string; name: string }>();
const foundCategories = new Set<string>();

function scanDir(dir: string, category: string) {
    const files = readdirSync(dir);
    for (const file of files) {
        const path = join(dir, file);
        const stat = statSync(path);

        if (stat.isDirectory()) {
            // Subcommand group (e.g. 'user')
            scanDir(path, category);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
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
            } catch (e) {
                log.verbose(`Could not load ${file}`, e);
            }
        }
    }
}

// Scan Root
if (existsSync(COMMANDS_DIR)) {
    const rootFiles = readdirSync(COMMANDS_DIR);
    for (const file of rootFiles) {
        const path = join(COMMANDS_DIR, file);
        const stat = statSync(path);

        if (stat.isDirectory()) {
            // Category folder
            scanDir(path, file);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            // Root command
            try {
                const cmdModule = require(path);
                const cmd = cmdModule.default || cmdModule;
                if (cmd && cmd.name) {
                    foundCommands.set(`General:${cmd.name}`, { category: 'General', name: cmd.name });
                    foundCategories.add('General');
                }
            } catch (e) { }
        }
    }
}

log.info(`Found ${foundCommands.size} commands in code.`);

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
        log.info(`Removed category: ${catName}`);
        continue;
    }

    for (const cmdName in cat.commands) {
        if (!foundCommands.has(`${catName}:${cmdName}`)) {
            delete cat.commands[cmdName];
            removedCount++;
            log.info(`Removed command: ${cmdName} from ${catName}`);
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
        log.success(`Added command: ${name} to ${category}`);
    }
});

// 5. Save
writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
log.success(`Sync Complete. Added: ${addedCount}, Removed: ${removedCount}`);
