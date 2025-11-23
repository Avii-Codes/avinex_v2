"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeHybridCommand = executeHybridCommand;
const discord_js_1 = require("discord.js");
const registry_1 = require("./registry");
const context_1 = require("./context");
const grammar_1 = require("./grammar");
const lexer_1 = require("./lexer");
const logger_1 = require("../../utils/logger");
// Cooldown Map: commandName -> Map<userId, timestamp>
const cooldowns = new Map();
async function executeHybridCommand(trigger, isAutocomplete = false) {
    let commandName;
    let subCommandName = null;
    let rawArgs = [];
    let isSlash = false;
    let isVirtual = false;
    // 1. Resolve Command & Arguments
    if (trigger instanceof discord_js_1.ChatInputCommandInteraction || trigger instanceof discord_js_1.AutocompleteInteraction) {
        isSlash = true;
        commandName = trigger.commandName;
        subCommandName = trigger.options.getSubcommand(false);
    }
    else {
        // Prefix or Virtual Command
        const content = 'content' in trigger ? trigger.content : '';
        const prefix = process.env.PREFIX || '!';
        // Virtual commands might not need prefix if called programmatically, but let's enforce consistency or allow bypass
        if (!content.startsWith(prefix))
            return;
        const tokens = (0, lexer_1.lexCommand)(content.slice(prefix.length).trim());
        if (tokens.length === 0)
            return;
        commandName = tokens[0].value.toLowerCase();
        // Check for subcommand
        const group = registry_1.registry.getGroup(commandName);
        if (group && tokens.length > 1) {
            const potentialSub = tokens[1].value.toLowerCase();
            if (group.subcommands.has(potentialSub)) {
                subCommandName = potentialSub;
                rawArgs = tokens.slice(2); // Remove cmd + sub
            }
            else {
                rawArgs = tokens.slice(1);
            }
        }
        else {
            rawArgs = tokens.slice(1);
        }
        if (!('client' in trigger))
            isVirtual = true;
    }
    // 2. Find Command
    let cmd;
    if (subCommandName) {
        const group = registry_1.registry.getGroup(commandName);
        cmd = group?.subcommands.get(subCommandName);
    }
    else {
        cmd = registry_1.registry.get(commandName);
        if (!cmd && !isSlash) {
            // Check aliases for prefix commands
            cmd = registry_1.registry.getByAlias(commandName);
        }
    }
    if (!cmd)
        return; // Command not found
    // 3. Autocomplete Handling
    if (isAutocomplete) {
        if (trigger instanceof discord_js_1.AutocompleteInteraction && cmd.auto) {
            const ctx = createContext(trigger, {}, cmd);
            try {
                await cmd.auto(ctx);
            }
            catch (e) {
                logger_1.log.error(`Autocomplete error in ${cmd.name}`, e);
            }
        }
        return;
    }
    // 4. Permission Checks
    const error = checkPermissions(cmd, trigger);
    if (error) {
        return replyError(trigger, error);
    }
    // 5. Cooldown Checks
    let userId = 'unknown';
    if (trigger instanceof discord_js_1.Message)
        userId = trigger.author.id;
    else if (trigger instanceof discord_js_1.ChatInputCommandInteraction || trigger instanceof discord_js_1.AutocompleteInteraction)
        userId = trigger.user.id;
    else if ('author' in trigger)
        userId = trigger.author.id;
    const cooldownCheck = checkCooldown(cmd.name, userId, cmd.cooldown);
    if (cooldownCheck.onCooldown) {
        return replyError(trigger, `Please wait ${cooldownCheck.remaining.toFixed(1)} seconds before using this command again.`);
    }
    // 6. Argument Parsing
    let args = {};
    if (cmd.args) {
        const parsedArgs = (0, grammar_1.parseGrammar)(cmd.args);
        if (isSlash && trigger instanceof discord_js_1.ChatInputCommandInteraction) {
            for (const arg of parsedArgs) {
                const val = trigger.options.get(arg.name)?.value;
                if (val !== undefined) {
                    if (arg.type === 'user') {
                        args[arg.name] = trigger.options.getUser(arg.name);
                    }
                    else if (arg.type === 'channel') {
                        args[arg.name] = trigger.options.getChannel(arg.name);
                    }
                    else if (arg.type === 'role') {
                        args[arg.name] = trigger.options.getRole(arg.name);
                    }
                    else {
                        args[arg.name] = val;
                    }
                }
            }
        }
        else if (!isSlash) {
            // Prefix/Virtual Parsing
            for (let i = 0; i < parsedArgs.length; i++) {
                const argDef = parsedArgs[i];
                const token = rawArgs[i];
                if (argDef.rest) {
                    const restContent = rawArgs.slice(i).map(t => t.raw).join(' ');
                    if (restContent)
                        args[argDef.name] = restContent;
                    break;
                }
                if (!token) {
                    if (!argDef.optional) {
                        return replyError(trigger, `Missing required argument: \`${argDef.name}\``);
                    }
                    continue;
                }
                let value = token.value;
                if (argDef.type === 'number') {
                    value = Number(value);
                    if (isNaN(value))
                        return replyError(trigger, `Argument \`${argDef.name}\` must be a number.`);
                }
                else if (argDef.type === 'boolean') {
                    value = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
                }
                else if (argDef.type === 'user') {
                    // Basic user resolution for prefix
                    const idMatch = value.match(/^<@!?(\d+)>$/) || [null, value];
                    const id = idMatch[1];
                    try {
                        if (id && 'client' in trigger) {
                            const user = await trigger.client.users.fetch(id);
                            value = user;
                        }
                        else {
                            // Fallback or Virtual
                            value = { id, toString: () => `<@${id}>` };
                        }
                    }
                    catch {
                        return replyError(trigger, `Invalid user for argument \`${argDef.name}\``);
                    }
                }
                args[argDef.name] = value;
            }
        }
    }
    // 7. Context Creation
    const ctx = createContext(trigger, args, cmd);
    // 8. Auto-Defer (Slash only)
    if (isSlash && trigger instanceof discord_js_1.ChatInputCommandInteraction) {
        setTimeout(() => {
            // Double check flags to avoid "Interaction already acknowledged"
            if (!trigger.replied && !trigger.deferred) {
                trigger.deferReply().catch(e => {
                    // Ignore "Unknown interaction" (10062) and "Interaction already acknowledged" (40060)
                    if (e.code !== 10062 && e.code !== 40060) {
                        logger_1.log.error('Failed to auto-defer', e);
                    }
                });
            }
        }, 250);
    }
    // 9. Execution
    try {
        const commandFullName = subCommandName ? `${commandName} ${subCommandName}` : commandName;
        logger_1.log.command(commandFullName, ctx.user.tag, args);
        await cmd.run(ctx);
    }
    catch (err) {
        logger_1.log.error(`Error executing command ${cmd.name}`, err);
        if (!ctx.raw && !isVirtual)
            return;
        const content = 'An error occurred while executing this command.';
        if (isSlash && trigger instanceof discord_js_1.ChatInputCommandInteraction) {
            if (trigger.deferred || trigger.replied) {
                trigger.editReply({ content });
            }
            else {
                trigger.reply({ content, ephemeral: true });
            }
        }
        else if (trigger instanceof discord_js_1.Message) {
            trigger.reply(content);
        }
        else {
            logger_1.log.error('Virtual execution failed', err);
        }
    }
}
function createContext(trigger, args, cmd) {
    if (trigger instanceof discord_js_1.Message) {
        return new context_1.Context(trigger.client, trigger.author, trigger.member, trigger.guild, trigger.channel, args, trigger);
    }
    else if (trigger instanceof discord_js_1.ChatInputCommandInteraction || trigger instanceof discord_js_1.AutocompleteInteraction) {
        return new context_1.Context(trigger.client, trigger.user, trigger.member, trigger.guild, trigger.channel, args, trigger);
    }
    else {
        // Virtual Context
        return new context_1.Context(trigger.client || null, trigger.author, trigger.member || null, trigger.guild || null, trigger.channel || null, args, null);
    }
}
function checkPermissions(cmd, trigger) {
    const user = trigger.author || trigger.user;
    const member = trigger.member;
    const guild = trigger.guild;
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
            const owners = (process.env.OWNER_IDS || '').split(',');
            if (!owners.includes(user.id)) {
                return '⛔ This command is reserved for the server owner.';
            }
        }
    }
    if (level === 'Admin') {
        if (member) {
            const owners = (process.env.OWNER_IDS || '').split(',');
            const isDev = owners.includes(user.id);
            const isOwner = guild && guild.ownerId === user.id;
            const isAdmin = member.permissions?.has(discord_js_1.PermissionsBitField.Flags.Administrator);
            if (!isDev && !isOwner && !isAdmin) {
                return '⛔ You need `Administrator` permission to use this command.';
            }
        }
    }
    // 2. Specific Discord Permissions Check
    if (cmd.permissions && member) {
        const owners = (process.env.OWNER_IDS || '').split(',');
        if (owners.includes(user.id))
            return null;
        if (!member.permissions?.has(cmd.permissions)) {
            return `⛔ You are missing the following permissions: \`${cmd.permissions.join(', ')}\``;
        }
    }
    return null;
}
function checkCooldown(commandName, userId, cooldownSeconds = 0) {
    if (!cooldownSeconds || cooldownSeconds <= 0) {
        return { onCooldown: false, remaining: 0 };
    }
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }
    const now = performance.now();
    const timestamps = cooldowns.get(commandName);
    const cooldownAmount = cooldownSeconds * 1000;
    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return { onCooldown: true, remaining: Math.max(0, timeLeft) };
        }
    }
    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);
    return { onCooldown: false, remaining: 0 };
}
async function replyError(trigger, content) {
    if (trigger instanceof discord_js_1.ChatInputCommandInteraction) {
        return trigger.reply({ content, ephemeral: true });
    }
    else if (trigger instanceof discord_js_1.Message) {
        return trigger.reply(content);
    }
}
//# sourceMappingURL=execution.js.map