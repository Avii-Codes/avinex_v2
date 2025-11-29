import { Client, Interaction, ButtonInteraction, StringSelectMenuInteraction, GuildMember } from 'discord.js';
import { ComponentRegistry } from './registry';
import { StateManager } from './state';
import { Context } from '../converter/context';
import { HybridCommand, ComponentContext, ComponentConfig, ComponentHandler } from '../converter/types';

const DEV_MODE = process.env.DEV_MODE === 'true';

// Dummy command for global handlers
const GLOBAL_COMMAND: HybridCommand = {
    name: 'global',
    description: 'Global Handler Context',
    run: async () => { }
};

// Cooldown tracking
const cooldowns = new Map<string, number>();

// Debounce tracking (userId:customId)
const processing = new Set<string>();

// Redis type definition (loose to avoid hard dependency on ioredis in index)
interface RouterOptions {
    redisClient?: any;
}

export function registerRouterPlugin(client: Client, options?: RouterOptions) {
    // Inject Redis client if provided
    if (options?.redisClient) {
        StateManager.setRedisClient(options.redisClient);
    }

    // 1. Scan Commands on Ready
    client.once('ready', () => {
        scanCommands(client);

        // Register Global Handlers
        const { registerGlobalHandlers } = require('../../handlers/global');
        registerGlobalHandlers();

        console.log('[Router] Plugin initialized.');
    });

    // 2. Listen for Interactions
    client.on('interactionCreate', async (interaction) => {
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            await handleInteraction(interaction);
        }
    });
}

function scanCommands(client: Client) {
    // Import registry from converter plugin
    const { registry } = require('../converter/registry');

    let count = 0;

    // Scan all top-level commands
    for (const cmd of registry.getAll()) {
        if (cmd.components) {
            // Register Name
            ComponentRegistry.registerCommandPrefix(cmd.name, cmd);

            // Register Aliases
            if (cmd.aliases) {
                for (const alias of cmd.aliases) {
                    ComponentRegistry.registerCommandPrefix(alias, cmd);
                }
            }
            count++;
        }
    }

    // Scan root commands (subcommands)
    for (const root of registry.getAllRoots()) {
        // Register direct subcommands
        for (const sub of root.subcommands.values()) {
            if (sub.components) {
                ComponentRegistry.registerCommandPrefix(sub.name, sub);
                if (sub.aliases) {
                    for (const alias of sub.aliases) {
                        ComponentRegistry.registerCommandPrefix(alias, sub);
                    }
                }
                count++;
            }
        }

        // Register group subcommands
        for (const group of root.groups.values()) {
            for (const sub of group.subcommands.values()) {
                if (sub.components) {
                    ComponentRegistry.registerCommandPrefix(sub.name, sub);
                    if (sub.aliases) {
                        for (const alias of sub.aliases) {
                            ComponentRegistry.registerCommandPrefix(alias, sub);
                        }
                    }
                    count++;
                }
            }
        }
    }

    if (DEV_MODE) console.log(`[Router] Scanned ${count} commands with components.`);
}

async function handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const customId = interaction.customId;

    // Parse ID: prefix:key:token
    const parts = customId.split(':');
    const prefix = parts[0];
    const key = parts[1];
    const token = parts[2]; // Optional

    if (DEV_MODE) console.log(`[Router] Interaction: ${customId} (Prefix: ${prefix}, Key: ${key})`);

    // 0. Debounce Check (Prevent Button Flicker / Double Clicks)
    const debounceKey = `${interaction.user.id}:${customId}`;
    if (processing.has(debounceKey)) {
        if (DEV_MODE) console.warn(`[Router] Ignored duplicate click from ${interaction.user.tag} on ${customId}`);
        return;
    }
    processing.add(debounceKey);

    try {
        let command: HybridCommand | undefined;
        let handler: ComponentHandler | undefined;
        let isGlobal = false;

        // 1. Try Command Lookup
        command = ComponentRegistry.getCommandByPrefix(prefix);
        if (command && command.components) {
            handler = command.components[key];
        }

        // 2. Try Global Lookup (if not found or if prefix matches global ID)
        if (!handler) {
            // Check if the entire customId is a global handler ID
            handler = ComponentRegistry.getGlobalHandler(customId);
            if (handler) {
                isGlobal = true;
                command = GLOBAL_COMMAND;
            }
        }

        if (!handler) {
            if (DEV_MODE) console.warn(`[Router] No handler found for ID: ${customId}`);
            // Optional: Reply with error if it looks like a router ID
            if (parts.length >= 2) {
                await interaction.reply({ content: '❌ Interaction failed: Handler not found.', ephemeral: true });
            }
            return;
        }

        // 3. Create Context
        const componentArgs = parts.slice(3); // Any extra parts?

        // Hydrate State
        let state = null;
        if (token) {
            state = await StateManager.get(token);
            if (DEV_MODE && state) console.log(`[Router] State Hydrated for ${token}`);
        }

        const ctx = new Context(
            interaction.client,
            interaction.user,
            interaction.member as GuildMember,
            interaction.guild,
            interaction.channel,
            {}, // Args (empty for now, or could be ID parts)
            interaction as any, // Interaction type (Button/SelectMenu)
            command!
        ) as unknown as ComponentContext;

        // Inject Component-specific props
        ctx.interaction = interaction;
        ctx.state = state;
        ctx.componentArgs = componentArgs;

        // Sync Group ID from state if available (keeps the session alive)
        if (state && state._messageGroupId) {
            ctx.groupId = state._messageGroupId;
        }

        // 4. Execute Handler
        try {
            // Auto-cleanup: Delete entire message group if state has a group ID
            if (ctx.state && ctx.state._messageGroupId) {
                StateManager.deleteGroup(ctx.state._messageGroupId);
            }

            if (typeof handler === 'function') {
                await handler(ctx);
            } else {
                // Config Object
                const config = handler as ComponentConfig;

                // Permission Checks
                if (config.ownerOnly && interaction.user.id !== process.env.OWNER_ID) {
                    await interaction.reply({
                        content: '❌ This action is restricted to the bot owner only.',
                        ephemeral: true
                    });
                    return;
                }

                // Discord Permission Check
                if (config.permissions && interaction.member && interaction.guild) {
                    const member = interaction.member as GuildMember;
                    const hasPermission = member.permissions.has(config.permissions);
                    if (!hasPermission) {
                        await interaction.reply({
                            content: '❌ You do not have the required permissions for this action.',
                            ephemeral: true
                        });
                        return;
                    }
                }

                // Role Check
                if (config.roles && interaction.member) {
                    const member = interaction.member as GuildMember;
                    const hasRole = config.roles.some(roleId => member.roles.cache.has(roleId));
                    if (!hasRole) {
                        await interaction.reply({
                            content: '❌ You do not have the required role for this action.',
                            ephemeral: true
                        });
                        return;
                    }
                }

                // User Check
                if (config.users && !config.users.includes(interaction.user.id)) {
                    await interaction.reply({
                        content: '❌ You are not authorized to use this action.',
                        ephemeral: true
                    });
                    return;
                }

                // Cooldown Check (simple in-memory implementation)
                if (config.cooldown) {
                    const cooldownKey = `${customId}:${interaction.user.id}`;
                    const now = Date.now();
                    const cooldownEnd = cooldowns.get(cooldownKey);

                    if (cooldownEnd && now < cooldownEnd) {
                        const remaining = Math.ceil((cooldownEnd - now) / 1000);
                        await interaction.reply({
                            content: `⏱️ Please wait ${remaining} seconds before using this again.`,
                            ephemeral: true
                        });
                        return;
                    }

                    // Set cooldown
                    cooldowns.set(cooldownKey, now + (config.cooldown * 1000));

                    // Auto-cleanup after cooldown expires
                    setTimeout(() => cooldowns.delete(cooldownKey), config.cooldown * 1000);
                }

                await config.run(ctx);
            }
        } catch (err) {
            console.error(`[Router] Error executing handler for ${customId}:`, err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred.', ephemeral: true });
            }
        }
    } catch (err) {
        console.error(`[Router] Error executing handler for ${customId}:`, err);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred.', ephemeral: true });
        }
    } finally {
        // Release Debounce Lock
        processing.delete(debounceKey);
    }
}
