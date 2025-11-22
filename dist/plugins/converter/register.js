"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
exports.registerConverterPlugin = registerConverterPlugin;
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
const context_1 = require("./context");
const grammar_1 = require("./grammar");
const config_1 = require("../../utils/config");
const logger_1 = require("../../utils/logger");
// Global store for our commands
exports.commands = new Map();
const subcommands = new Map();
const cooldowns = new Map(); // Map<commandName, Map<userId, timestamp>>
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
                        if (!subcommands.has(groupName)) {
                            subcommands.set(groupName, {
                                name: groupName,
                                description: `Commands for ${groupName}`,
                                subcommands: new Map()
                            });
                        }
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
        if (!cmd || !cmd.name)
            return false;
        // Get Command Config
        const cmdConfig = config_1.configManager.getCommand(categoryName, cmd.name, {
            aliases: cmd.aliases,
            cooldown: cmd.cooldown
        });
        if (!cmdConfig.enabled) {
            logger_1.log.verbose(`Skipping disabled command: ${cmd.name} (${categoryName})`);
            return false;
        }
        // Apply config values to command
        cmd.aliases = cmdConfig.aliases;
        cmd.cooldown = cmdConfig.cooldown;
        if (parentGroup) {
            const group = subcommands.get(parentGroup);
            if (group) {
                group.subcommands.set(cmd.name, cmd);
                logger_1.log.verbose(`Loaded subcommand: ${parentGroup} ${cmd.name} [${categoryName}]`);
                return true;
            }
        }
        else {
            exports.commands.set(cmd.name, cmd);
            logger_1.log.verbose(`Loaded command: ${cmd.name} [${categoryName}]`);
            return true;
        }
    }
    catch (e) {
        logger_1.log.error(`Failed to load command at ${path}`, e);
    }
    return false;
}
// Cooldown helper function
function checkCooldown(commandName, userId, cooldownSeconds = 0) {
    if (!cooldownSeconds || cooldownSeconds <= 0) {
        return { onCooldown: false, remaining: 0 };
    }
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    const cooldownAmount = cooldownSeconds * 1000;
    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return { onCooldown: true, remaining: timeLeft };
        }
    }
    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    return { onCooldown: false, remaining: 0 };
}
async function deployCommands(client) {
    const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const body = [];
    // Top-level commands
    for (const cmd of exports.commands.values()) {
        if (cmd.type === 'prefix')
            continue; // Skip prefix-only
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
    // Subcommands
    for (const group of subcommands.values()) {
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
// --- PERMISSION HELPER ---
function checkPermissions(cmd, member, user, guild) {
    // 1. Level Check
    const level = cmd.level || 'User';
    if (level === 'Developer') {
        const owners = (process.env.OWNER_IDS || '').split(',');
        if (!owners.includes(user.id)) {
            return '⛔ This command is reserved for the bot developer.';
        }
    }
    if (level === 'ServerOwner') {
        if (guild && guild.ownerId !== user.id) {
            // Developers bypass ServerOwner check
            const owners = (process.env.OWNER_IDS || '').split(',');
            if (!owners.includes(user.id)) {
                return '⛔ This command is reserved for the server owner.';
            }
        }
    }
    if (level === 'Admin') {
        if (member) {
            // Developers and Server Owners bypass Admin check
            const owners = (process.env.OWNER_IDS || '').split(',');
            const isDev = owners.includes(user.id);
            const isOwner = guild && guild.ownerId === user.id;
            const isAdmin = member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator);
            if (!isDev && !isOwner && !isAdmin) {
                return '⛔ You need `Administrator` permission to use this command.';
            }
        }
    }
    // 2. Specific Discord Permissions Check
    if (cmd.permissions && member) {
        // Developers bypass specific permissions? Usually yes, but let's keep it strict or bypass.
        // Let's allow devs to bypass everything for convenience.
        const owners = (process.env.OWNER_IDS || '').split(',');
        if (owners.includes(user.id))
            return null;
        if (!member.permissions.has(cmd.permissions)) {
            return `⛔ You are missing the following permissions: \`${cmd.permissions.join(', ')}\``;
        }
    }
    return null;
}
// --- RUNTIME HANDLERS ---
async function handleInteraction(interaction) {
    if (interaction.isAutocomplete()) {
        const cmdName = interaction.commandName;
        const subName = interaction.options.getSubcommand(false);
        let cmd;
        if (subName) {
            const group = subcommands.get(cmdName);
            cmd = group?.subcommands.get(subName);
        }
        else {
            cmd = exports.commands.get(cmdName);
        }
        if (cmd && cmd.auto) {
            const ctx = new context_1.Context(interaction.client, interaction.user, interaction.member, interaction.guild, interaction.channel, {}, interaction);
            await cmd.auto(ctx);
        }
        return;
    }
    if (!interaction.isChatInputCommand())
        return;
    const cmdName = interaction.commandName;
    const subName = interaction.options.getSubcommand(false);
    let cmd;
    if (subName) {
        const group = subcommands.get(cmdName);
        cmd = group?.subcommands.get(subName);
    }
    else {
        cmd = exports.commands.get(cmdName);
    }
    if (!cmd)
        return;
    // Permission Check
    const error = checkPermissions(cmd, interaction.member, interaction.user, interaction.guild);
    if (error) {
        return interaction.reply({ content: error, ephemeral: true });
    }
    // Parse Args from Interaction
    const args = {};
    if (cmd.args) {
        const parsedArgs = (0, grammar_1.parseGrammar)(cmd.args);
        for (const arg of parsedArgs) {
            const val = interaction.options.get(arg.name)?.value;
            if (val !== undefined) {
                if (arg.type === 'user') {
                    args[arg.name] = interaction.options.getUser(arg.name);
                }
                else {
                    args[arg.name] = val;
                }
            }
        }
    }
    const ctx = new context_1.Context(interaction.client, interaction.user, interaction.member, interaction.guild, interaction.channel, args, interaction);
    // Log command execution
    const commandFullName = subName ? `${cmdName} ${subName}` : cmdName;
    logger_1.log.command(commandFullName, interaction.user.tag, args);
    // Check cooldown
    const cooldownCheck = checkCooldown(commandFullName, interaction.user.id, cmd.cooldown);
    if (cooldownCheck.onCooldown) {
        return interaction.reply({
            content: `Please wait ${cooldownCheck.remaining.toFixed(1)} seconds before using this command again.`,
            ephemeral: true
        });
    }
    try {
        await cmd.run(ctx);
    }
    catch (err) {
        logger_1.log.error(`Error executing command: ${commandFullName}`, err);
        if (!interaction.replied)
            interaction.reply({ content: 'Error executing command', ephemeral: true });
    }
}
async function handleMessage(message) {
    if (message.author.bot)
        return;
    const prefix = process.env.PREFIX || '!';
    if (!message.content.startsWith(prefix))
        return;
    const rawContent = message.content.slice(prefix.length).trim();
    const parts = rawContent.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (parts.length === 0)
        return;
    const commandName = parts.shift().toLowerCase();
    // Check for normal command
    let cmd = exports.commands.get(commandName);
    // If not found by name, check aliases
    if (!cmd) {
        for (const [name, command] of exports.commands) {
            if (command.aliases && command.aliases.includes(commandName)) {
                cmd = command;
                break;
            }
        }
    }
    // Check for subcommand (e.g. !user info)
    let subCommandName;
    if (!cmd && subcommands.has(commandName)) {
        const group = subcommands.get(commandName);
        const subName = parts[0]?.toLowerCase();
        if (subName && group?.subcommands.has(subName)) {
            cmd = group.subcommands.get(subName);
            subCommandName = subName;
            parts.shift(); // consume subcommand name
        }
    }
    if (!cmd)
        return;
    if (cmd.type === 'slash')
        return; // Slash only
    // Permission Check
    const error = checkPermissions(cmd, message.member, message.author, message.guild);
    if (error) {
        return message.reply(error);
    }
    // Parse Prefix Args
    const args = {};
    if (cmd.args) {
        const parsedArgs = (0, grammar_1.parseGrammar)(cmd.args);
        for (let i = 0; i < parsedArgs.length; i++) {
            const argDef = parsedArgs[i];
            const rawArg = parts[i];
            if (argDef.rest) {
                // Rest argument consumes everything left
                const restContent = parts.slice(i).join(' ');
                if (restContent)
                    args[argDef.name] = restContent;
                break;
            }
            if (!rawArg) {
                if (!argDef.optional) {
                    return message.reply(`Missing required argument: \`${argDef.name}\``);
                }
                continue;
            }
            // Basic Type Conversion
            let value = rawArg.replace(/^"|"$/g, ''); // remove quotes
            if (argDef.type === 'number') {
                value = Number(value);
                if (isNaN(value))
                    return message.reply(`Argument \`${argDef.name}\` must be a number.`);
            }
            else if (argDef.type === 'user') {
                // Try to resolve user from mention or ID
                const idMatch = value.match(/^<@!?(\d+)>$/) || [null, value];
                const id = idMatch[1];
                try {
                    const user = await message.client.users.fetch(id);
                    value = user;
                }
                catch {
                    return message.reply(`Invalid user for argument \`${argDef.name}\``);
                }
            }
            else if (argDef.type === 'boolean') {
                value = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
            }
            args[argDef.name] = value;
        }
    }
    const ctx = new context_1.Context(message.client, message.author, message.member, message.guild, message.channel, args, message);
    // Log command execution
    const commandFullName = subCommandName ? `${commandName} ${subCommandName}` : commandName;
    logger_1.log.command(commandFullName, message.author.tag, args);
    // Check cooldown
    const cooldownCheck = checkCooldown(commandFullName, message.author.id, cmd.cooldown);
    if (cooldownCheck.onCooldown) {
        return message.reply(`Please wait ${cooldownCheck.remaining.toFixed(1)} seconds before using this command again.`);
    }
    try {
        await cmd.run(ctx);
    }
    catch (err) {
        logger_1.log.error(`Error executing command: ${commandFullName}`, err);
        message.reply('Error executing command.');
    }
}
