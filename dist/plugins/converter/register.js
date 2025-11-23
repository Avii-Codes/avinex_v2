"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConverterPlugin = registerConverterPlugin;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
const grammar_1 = require("./grammar");
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
const registry_1 = require("./registry");
const execution_1 = require("./execution");
async function registerConverterPlugin(client) {
    logger_1.log.loading('Loading Converter Plugin...');
    // 1. Load Commands
    const commandsPath = (0, path_1.join)(process.cwd(), 'src', 'commands');
    loadCommands(commandsPath);
    // Save any new defaults found during load
    config_1.configManager.save();
    // 2. Register Event Listeners
    client.on(discord_js_1.Events.MessageCreate, handleMessage);
    client.on(discord_js_1.Events.InteractionCreate, handleInteraction);
    // 3. Deploy Slash Commands (on ready)
    client.once(discord_js_1.Events.ClientReady, async (c) => {
        logger_1.log.success(`Logged in as ${c.user.tag}`);
        await deployCommands(c);
    });
}
function loadCommands(dir) {
    try {
        // 1. Scan Root (src/commands)
        const rootFiles = (0, fs_1.readdirSync)(dir);
        const categoryStats = new Map();
        for (const file of rootFiles) {
            const path = (0, path_1.join)(dir, file);
            const stat = (0, fs_1.statSync)(path);
            if (stat.isDirectory()) {
                // This is a CATEGORY folder (e.g. 'moderation', 'utility')
                const categoryName = file;
                const categoryPath = path;
                let commandCount = 0;
                // Check Config for Category
                const categoryConfig = config_1.configManager.getCategory(categoryName);
                if (!categoryConfig.enabled) {
                    logger_1.log.category(categoryName, 0, false);
                    continue;
                }
                // Scan the Category Folder
                const catFiles = (0, fs_1.readdirSync)(categoryPath);
                for (const catFile of catFiles) {
                    const catFilePath = (0, path_1.join)(categoryPath, catFile);
                    const catStat = (0, fs_1.statSync)(catFilePath);
                    if (catStat.isDirectory()) {
                        // This is a SUBCOMMAND GROUP (e.g. 'user') inside a category
                        const groupName = catFile;
                        // Register Group
                        registry_1.registry.registerGroup({
                            name: groupName,
                            description: `Commands for ${groupName}`,
                            subcommands: new Map()
                        });
                        // Load subcommands
                        const subCount = loadSubcommands(catFilePath, groupName, categoryName);
                        commandCount += subCount;
                    }
                    else if (catFile.endsWith('.ts') || catFile.endsWith('.js')) {
                        // This is a TOP-LEVEL COMMAND inside a category
                        if (loadSingleCommand(catFilePath, categoryName)) {
                            commandCount++;
                        }
                    }
                }
                categoryStats.set(categoryName, commandCount);
            }
            else if (file.endsWith('.ts') || file.endsWith('.js')) {
                // This is a TOP-LEVEL COMMAND in the root (Category: General)
                if (loadSingleCommand(path, 'General')) {
                    categoryStats.set('General', (categoryStats.get('General') || 0) + 1);
                }
            }
        }
        // Log category stats
        categoryStats.forEach((count, category) => {
            logger_1.log.category(category, count);
        });
    }
    catch (err) {
        logger_1.log.error('Could not load commands', err);
        process.exit(1);
    }
}
function loadSubcommands(dir, groupName, categoryName) {
    const files = (0, fs_1.readdirSync)(dir);
    let count = 0;
    for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
            const path = (0, path_1.join)(dir, file);
            if (loadSingleCommand(path, categoryName, groupName)) {
                count++;
            }
        }
    }
    return count;
}
function loadSingleCommand(path, categoryName, parentGroup) {
    try {
        const cmdModule = require(path);
        const cmd = cmdModule.default || cmdModule;
        if (!cmd)
            return false;
        // Validate Command
        const validationError = validateCommand(cmd, path);
        if (validationError) {
            logger_1.log.error(`[FATAL] Invalid command at ${path}: ${validationError}`);
            process.exit(1);
        }
        registry_1.registry.register(cmd, path, categoryName, parentGroup);
        return true;
    }
    catch (e) {
        logger_1.log.error(`Failed to load command at ${path}`, e);
        process.exit(1);
    }
}
function validateCommand(cmd, path) {
    if (!cmd.name)
        return 'Missing "name" property.';
    if (!/^[\w-]{1,32}$/.test(cmd.name))
        return 'Name must be 1-32 characters, alphanumeric/dashes only (lowercase recommended).';
    if (!cmd.description)
        return 'Missing "description" property.';
    if (cmd.description.length < 1 || cmd.description.length > 100)
        return 'Description must be between 1 and 100 characters.';
    if (!cmd.run || typeof cmd.run !== 'function')
        return 'Missing "run" function.';
    return null;
}
// --- RUNTIME HANDLERS ---
async function handleInteraction(interaction) {
    if (interaction.isAutocomplete()) {
        await (0, execution_1.executeHybridCommand)(interaction, true);
        return;
    }
    if (!interaction.isChatInputCommand())
        return;
    await (0, execution_1.executeHybridCommand)(interaction);
}
async function handleMessage(message) {
    if (message.author.bot)
        return;
    await (0, execution_1.executeHybridCommand)(message);
}
async function deployCommands(client) {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const body = [];
    // Top-level commands
    for (const cmd of registry_1.registry.getAll()) {
        if (cmd.type === 'prefix')
            continue; // Skip prefix-only
        try {
            const builder = new discord_js_1.SlashCommandBuilder()
                .setName(cmd.name)
                .setDescription(cmd.description);
            if (cmd.args) {
                const args = (0, grammar_1.parseGrammar)(cmd.args);
                applyArgsToBuilder(builder, args);
            }
            if (cmd.permissions) {
                builder.setDefaultMemberPermissions(discord_js_1.PermissionsBitField.resolve(cmd.permissions));
            }
            body.push(builder.toJSON());
        }
        catch (e) {
            logger_1.log.error(`Failed to build slash command "${cmd.name}": ${e.message}`);
            continue; // Skip invalid command but continue deploying others
        }
    }
    // Subcommands
    for (const group of registry_1.registry.getAllGroups()) {
        try {
            const builder = new discord_js_1.SlashCommandBuilder()
                .setName(group.name)
                .setDescription(group.description);
            for (const sub of group.subcommands.values()) {
                const subBuilder = new discord_js_1.SlashCommandSubcommandBuilder()
                    .setName(sub.name)
                    .setDescription(sub.description);
                if (sub.args) {
                    const args = (0, grammar_1.parseGrammar)(sub.args);
                    applyArgsToBuilder(subBuilder, args);
                }
                builder.addSubcommand(subBuilder);
            }
            body.push(builder.toJSON());
        }
        catch (e) {
            logger_1.log.error(`Failed to build subcommand group "${group.name}": ${e.message}`);
            continue;
        }
    }
    try {
        logger_1.log.loading('Deploying slash commands...');
        // Deploy global for simplicity in this demo
        if (client.user) {
            await rest.put(discord_js_1.Routes.applicationCommands(client.user.id), { body });
            logger_1.log.success('Commands deployed successfully!');
        }
    }
    catch (error) {
        logger_1.log.error('Deploy failed', error);
    }
}
function applyArgsToBuilder(builder, args) {
    for (const arg of args) {
        const setCommon = (opt) => opt.setName(arg.name)
            .setDescription(`Argument: ${arg.name}`)
            .setRequired(!arg.optional);
        switch (arg.type) {
            case 'string':
            case 'auto':
                builder.addStringOption((opt) => {
                    setCommon(opt);
                    if (arg.type === 'auto')
                        opt.setAutocomplete(true);
                    return opt;
                });
                break;
            case 'number':
                builder.addNumberOption(setCommon);
                break;
            case 'user':
                builder.addUserOption(setCommon);
                break;
            case 'boolean':
                builder.addBooleanOption(setCommon);
                break;
            case 'channel':
                builder.addChannelOption(setCommon);
                break;
            case 'role':
                builder.addRoleOption(setCommon);
                break;
        }
    }
}
//# sourceMappingURL=register.js.map