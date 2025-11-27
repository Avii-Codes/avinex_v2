import {
    ChatInputCommandInteraction,
    Message,
    PermissionsBitField,
    AutocompleteInteraction,
    User,
    Client,
    GuildMember,
    Guild,
    TextBasedChannel
} from 'discord.js';
import { registry } from './registry';
import { Context } from './context';
import { parseGrammar } from './grammar';
import { lexCommand } from './lexer';
import { log } from '../../utils/logger';
import { HybridCommand, HybridContext } from './types';
import { GuildModel } from '../../database/models/Guild';
import { UserModel } from '../../database/models/User';

// Cooldown Map: commandName -> Map<userId, timestamp>
const cooldowns = new Map<string, Map<string, number>>();

export interface VirtualTrigger {
    content: string;
    author: { id: string; tag: string; bot: boolean };
    member?: any;
    guild?: any;
    channel?: any;
}

export async function executeHybridCommand(
    trigger: Message | ChatInputCommandInteraction | AutocompleteInteraction | VirtualTrigger,
    isAutocomplete: boolean = false
) {
    let commandName: string;
    let subCommandName: string | null = null;
    let rawArgs: any[] = [];
    let isSlash = false;
    let isVirtual = false;

    let cmd: HybridCommand | undefined;
    let usedAlias: string | null = null;
    let groupName: string | null = null;

    // 1. Resolve Command & Arguments
    if (trigger instanceof ChatInputCommandInteraction || trigger instanceof AutocompleteInteraction) {
        isSlash = true;
        commandName = trigger.commandName;
        subCommandName = trigger.options.getSubcommand(false);
        groupName = trigger.options.getSubcommandGroup(false);

        if (groupName) {
            // 3-level: /root group sub
            const root = registry.getRoot(commandName);
            const group = root?.groups.get(groupName);
            cmd = group?.subcommands.get(subCommandName!);
        } else if (subCommandName) {
            // 2-level: /root sub
            const root = registry.getRoot(commandName);
            cmd = root?.subcommands.get(subCommandName);
        } else {
            // 1-level: /command
            cmd = registry.get(commandName);
        }
    } else {
        // Prefix or Virtual Command
        const content = 'content' in trigger ? trigger.content : '';
        const prefix = process.env.PREFIX || '!';

        // Virtual commands might not need prefix if called programmatically, but let's enforce consistency or allow bypass
        if (!content.startsWith(prefix)) return;

        const tokens = lexCommand(content.slice(prefix.length).trim());
        if (tokens.length === 0) return;

        commandName = tokens[0].value.toLowerCase();

        // Check for subcommand
        const root = registry.getRoot(commandName);

        if (root && tokens.length > 1) {
            const potentialSubOrGroup = tokens[1].value.toLowerCase();

            // Check if it's a group
            if (root.groups.has(potentialSubOrGroup)) {
                if (tokens.length > 2) {
                    const potentialSub = tokens[2].value.toLowerCase();
                    const group = root.groups.get(potentialSubOrGroup)!;

                    if (group.subcommands.has(potentialSub)) {
                        // Found /root group sub
                        cmd = group.subcommands.get(potentialSub);
                        subCommandName = potentialSub;
                        groupName = potentialSubOrGroup;
                        rawArgs = tokens.slice(3);
                    }
                }
            }

            // If not found yet, check direct subcommand
            if (!cmd && root.subcommands.has(potentialSubOrGroup)) {
                // Found /root sub
                cmd = root.subcommands.get(potentialSubOrGroup);
                subCommandName = potentialSubOrGroup;
                rawArgs = tokens.slice(2);
            }
        }

        if (!cmd) {
            // Fallback to top-level command
            cmd = registry.get(commandName);
            rawArgs = tokens.slice(1);

            if (!cmd && !isSlash) {
                // Check aliases for prefix commands
                const aliasCmd = registry.getByAlias(commandName);
                if (aliasCmd) {
                    usedAlias = commandName; // Store the alias that was used
                    cmd = aliasCmd;
                }
            }
        }

        if (!('client' in trigger)) isVirtual = true;
    }

    // 2. Find Command

    if (subCommandName) {
        const root = registry.getRoot(commandName);
        if (groupName) {
            const group = root?.groups.get(groupName);
            cmd = group?.subcommands.get(subCommandName);
        } else {
            cmd = root?.subcommands.get(subCommandName);
        }
    } else {
        cmd = registry.get(commandName);
        if (!cmd && !isSlash) {
            // Check aliases for prefix commands
            const aliasCmd = registry.getByAlias(commandName);
            if (aliasCmd) {
                usedAlias = commandName; // Store the alias that was used
                cmd = aliasCmd;
            }
        }
    }

    if (!cmd) return; // Command not found

    // 3. Autocomplete Handling
    if (isAutocomplete) {
        if (trigger instanceof AutocompleteInteraction && cmd.auto) {
            const ctx = createContext(trigger, {}, cmd);
            try {
                await cmd.auto(ctx);
            } catch (e) {
                log.error(`Autocomplete error in ${cmd.name}`, e);
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
    if (trigger instanceof Message) userId = trigger.author.id;
    else if (trigger instanceof ChatInputCommandInteraction || trigger instanceof AutocompleteInteraction) userId = trigger.user.id;
    else if ('author' in trigger) userId = trigger.author.id;

    const cooldownCheck = checkCooldown(cmd.name, userId, cmd.cooldown);
    if (cooldownCheck.onCooldown) {
        return replyError(trigger, `Please wait ${cooldownCheck.remaining.toFixed(1)} seconds before using this command again.`);
    }

    // 6. Argument Parsing
    let args: Record<string, any> = {};
    if (cmd.args) {
        const parsedArgs = parseGrammar(cmd.args);

        if (isSlash && trigger instanceof ChatInputCommandInteraction) {
            for (const arg of parsedArgs) {
                const val = trigger.options.get(arg.name)?.value;
                if (val !== undefined) {
                    if (arg.type === 'user') {
                        args[arg.name] = trigger.options.getUser(arg.name);
                    } else if (arg.type === 'channel') {
                        args[arg.name] = trigger.options.getChannel(arg.name);
                    } else if (arg.type === 'role') {
                        args[arg.name] = trigger.options.getRole(arg.name);
                    } else {
                        args[arg.name] = val;
                    }
                }
            }
        } else if (!isSlash) {
            // Prefix/Virtual Parsing
            for (let i = 0; i < parsedArgs.length; i++) {
                const argDef = parsedArgs[i];
                const token = rawArgs[i];

                if (argDef.rest) {
                    const restContent = rawArgs.slice(i).map(t => t.raw).join(' ');
                    if (restContent) args[argDef.name] = restContent;
                    break;
                }

                if (!token) {
                    if (!argDef.optional) {
                        return replyError(trigger, `Missing required argument: \`${argDef.name}\``);
                    }
                    continue;
                }

                let value: any = token.value;

                if (argDef.type === 'number') {
                    value = Number(value);
                    if (isNaN(value)) return replyError(trigger, `Argument \`${argDef.name}\` must be a number.`);
                } else if (argDef.type === 'boolean') {
                    value = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
                } else if (argDef.type === 'user') {
                    // Basic user resolution for prefix
                    const idMatch = value.match(/^<@!?(\d+)>$/) || [null, value];
                    const id = idMatch[1];
                    try {
                        if (id && 'client' in trigger) {
                            const user = await (trigger as any).client.users.fetch(id);
                            value = user;
                        } else {
                            // Fallback or Virtual
                            value = { id, toString: () => `<@${id}>` };
                        }
                    } catch {
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
    if (isSlash && trigger instanceof ChatInputCommandInteraction) {
        setTimeout(() => {
            // Double check flags to avoid "Interaction already acknowledged"
            if (!trigger.replied && !trigger.deferred) {
                trigger.deferReply().catch(e => {
                    // Ignore "Unknown interaction" (10062) and "Interaction already acknowledged" (40060)
                    if (e.code !== 10062 && e.code !== 40060) {
                        log.error('Failed to auto-defer', e);
                    }
                });
            }
        }, 2000);
    }

    // 9. Execution
    try {
        let commandFullName = cmd.name;
        if (subCommandName) {
            if (groupName) {
                commandFullName = `${commandName} ${groupName} ${subCommandName}`;
            } else {
                commandFullName = `${commandName} ${subCommandName}`;
            }
        }
        if (usedAlias) {
            commandFullName += ` (alias: ${usedAlias})`;
        }

        // Ensure guild data exists if in a guild
        if (ctx.guild) {
            try {
                await GuildModel.findOneAndUpdate(
                    { guildId: ctx.guild.id },
                    { guildId: ctx.guild.id },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                // Ensure user data exists
                if (ctx.user) {
                    await UserModel.findOneAndUpdate(
                        { userId: ctx.user.id, guildId: ctx.guild.id },
                        { userId: ctx.user.id, guildId: ctx.guild.id },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                }
            } catch (dbError) {
                log.error(`Failed to ensure data for ${ctx.guild.name}`, dbError);
            }
        }

        log.command(commandFullName, ctx.user.tag, args);
        await cmd.run(ctx);
    } catch (err) {
        log.error(`Error executing command ${cmd.name}`, err);
        if (!ctx.raw && !isVirtual) return;

        const content = 'An error occurred while executing this command.';
        if (isSlash && trigger instanceof ChatInputCommandInteraction) {
            if (trigger.deferred || trigger.replied) {
                trigger.editReply({ content });
            } else {
                trigger.reply({ content, ephemeral: true });
            }
        } else if (trigger instanceof Message) {
            trigger.reply(content);
        } else {
            log.error('Virtual execution failed', err);
        }
    }
}

function createContext(trigger: any, args: any, cmd: HybridCommand): HybridContext {
    if (trigger instanceof Message) {
        return new Context(
            trigger.client,
            trigger.author,
            trigger.member,
            trigger.guild,
            trigger.channel,
            args,
            trigger,
            cmd
        );
    } else if (trigger instanceof ChatInputCommandInteraction || trigger instanceof AutocompleteInteraction) {
        return new Context(
            trigger.client,
            trigger.user,
            trigger.member as GuildMember,
            trigger.guild,
            trigger.channel,
            args,
            trigger,
            cmd
        );
    } else {
        // Virtual Context
        return new Context(
            (trigger as any).client || null,
            trigger.author,
            trigger.member || null,
            trigger.guild || null,
            trigger.channel || null,
            args,
            null,
            cmd
        );
    }
}

function checkPermissions(cmd: HybridCommand, trigger: any): string | null {
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
            const isAdmin = member.permissions?.has(PermissionsBitField.Flags.Administrator);

            if (!isDev && !isOwner && !isAdmin) {
                return '⛔ You need `Administrator` permission to use this command.';
            }
        }
    }

    // 2. Specific Discord Permissions Check
    if (cmd.permissions && member) {
        const owners = (process.env.OWNER_IDS || '').split(',');
        if (owners.includes(user.id)) return null;

        if (!member.permissions?.has(cmd.permissions)) {
            return `⛔ You are missing the following permissions: \`${(cmd.permissions as any[]).join(', ')}\``;
        }
    }

    return null;
}

function checkCooldown(commandName: string, userId: string, cooldownSeconds: number = 0): { onCooldown: boolean; remaining: number } {
    if (!cooldownSeconds || cooldownSeconds <= 0) {
        return { onCooldown: false, remaining: 0 };
    }

    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }

    const now = performance.now();
    const timestamps = cooldowns.get(commandName)!;
    const cooldownAmount = cooldownSeconds * 1000;

    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId)! + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return { onCooldown: true, remaining: Math.max(0, timeLeft) };
        }
    }

    timestamps.set(userId, now);
    setTimeout(() => timestamps.delete(userId), cooldownAmount);

    return { onCooldown: false, remaining: 0 };
}

async function replyError(trigger: any, content: string) {
    if (trigger instanceof ChatInputCommandInteraction) {
        return trigger.reply({ content, ephemeral: true });
    } else if (trigger instanceof Message) {
        return trigger.reply(content);
    }
}
