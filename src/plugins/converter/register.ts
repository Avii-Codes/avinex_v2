import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
  Message,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  PermissionsBitField,
  PermissionResolvable,
  TextBasedChannel,
  User,
  GuildMember
} from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Context } from './context';
import { parseGrammar } from './grammar';
import { CommandArg, HybridCommand, SubCommandGroup } from './types';
import { configManager } from '../../utils/config';
import { log } from '../../utils/logger';

// Global store for our commands
export const commands = new Map<string, HybridCommand>();
const subcommands = new Map<string, SubCommandGroup>();
const cooldowns = new Map<string, Map<string, number>>(); // Map<commandName, Map<userId, timestamp>>

export async function registerConverterPlugin(client: Client) {
  log.loading('Loading Converter Plugin...');

  // 1. Load Commands
  const commandsPath = join(process.cwd(), 'src', 'commands');
  loadCommands(commandsPath);

  // Save any new defaults found during load
  configManager.save();

  // 2. Register Event Listeners
  client.on(Events.MessageCreate, handleMessage);
  client.on(Events.InteractionCreate, handleInteraction);

  // 3. Deploy Slash Commands (on ready)
  client.once(Events.ClientReady, async (c) => {
    log.success(`Logged in as ${c.user.tag}`);
    await deployCommands(c);
  });
}

function loadCommands(dir: string) {
  try {
    // 1. Scan Root (src/commands)
    const rootFiles = readdirSync(dir);
    const categoryStats = new Map<string, number>();

    for (const file of rootFiles) {
      const path = join(dir, file);
      const stat = statSync(path);

      if (stat.isDirectory()) {
        // This is a CATEGORY folder (e.g. 'moderation', 'utility')
        const categoryName = file;
        const categoryPath = path;
        let commandCount = 0;

        // Check Config for Category
        const categoryConfig = configManager.getCategory(categoryName);
        if (!categoryConfig.enabled) {
          log.category(categoryName, 0, false);
          continue;
        }

        // Scan the Category Folder
        const catFiles = readdirSync(categoryPath);
        for (const catFile of catFiles) {
          const catFilePath = join(categoryPath, catFile);
          const catStat = statSync(catFilePath);

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

          } else if (catFile.endsWith('.ts') || catFile.endsWith('.js')) {
            // This is a TOP-LEVEL COMMAND inside a category
            if (loadSingleCommand(catFilePath, categoryName)) {
              commandCount++;
            }
          }
        }

        categoryStats.set(categoryName, commandCount);

      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // This is a TOP-LEVEL COMMAND in the root (Category: General)
        if (loadSingleCommand(path, 'General')) {
          categoryStats.set('General', (categoryStats.get('General') || 0) + 1);
        }
      }
    }

    // Log category stats
    categoryStats.forEach((count, category) => {
      log.category(category, count);
    });

  } catch (err) {
    log.error('Could not load commands', err);
  }
}

function loadSubcommands(dir: string, groupName: string, categoryName: string): number {
  const files = readdirSync(dir);
  let count = 0;
  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const path = join(dir, file);
      if (loadSingleCommand(path, categoryName, groupName)) {
        count++;
      }
    }
  }
  return count;
}

function loadSingleCommand(path: string, categoryName: string, parentGroup?: string): boolean {
  try {
    const cmdModule = require(path);
    const cmd: HybridCommand = cmdModule.default || cmdModule;

    if (!cmd || !cmd.name) return false;

    // Get Command Config
    const cmdConfig = configManager.getCommand(categoryName, cmd.name, {
      aliases: cmd.aliases,
      cooldown: cmd.cooldown
    });

    if (!cmdConfig.enabled) {
      log.verbose(`Skipping disabled command: ${cmd.name} (${categoryName})`);
      return false;
    }

    // Apply config values to command
    cmd.aliases = cmdConfig.aliases;
    cmd.cooldown = cmdConfig.cooldown;

    if (parentGroup) {
      const group = subcommands.get(parentGroup);
      if (group) {
        group.subcommands.set(cmd.name, cmd);
        log.verbose(`Loaded subcommand: ${parentGroup} ${cmd.name} [${categoryName}]`);
        return true;
      }
    } else {
      commands.set(cmd.name, cmd);
      log.verbose(`Loaded command: ${cmd.name} [${categoryName}]`);
      return true;
    }
  } catch (e) {
    log.error(`Failed to load command at ${path}`, e);
  }
  return false;
}

// Cooldown helper function
function checkCooldown(commandName: string, userId: string, cooldownSeconds: number = 0): { onCooldown: boolean; remaining: number } {
  if (!cooldownSeconds || cooldownSeconds <= 0) {
    return { onCooldown: false, remaining: 0 };
  }

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Map());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName)!;
  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, remaining: timeLeft };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);

  return { onCooldown: false, remaining: 0 };
}

async function deployCommands(client: Client) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  const body: any[] = [];

  // Top-level commands
  for (const cmd of commands.values()) {
    if (cmd.type === 'prefix') continue; // Skip prefix-only

    const builder = new SlashCommandBuilder()
      .setName(cmd.name)
      .setDescription(cmd.description);

    if (cmd.args) {
      const args = parseGrammar(cmd.args);
      applyArgsToBuilder(builder, args);
    }

    if (cmd.permissions) {
      builder.setDefaultMemberPermissions(PermissionsBitField.resolve(cmd.permissions));
    }

    body.push(builder.toJSON());
  }

  // Subcommands
  for (const group of subcommands.values()) {
    const builder = new SlashCommandBuilder()
      .setName(group.name)
      .setDescription(group.description);

    for (const sub of group.subcommands.values()) {
      const subBuilder = new SlashCommandSubcommandBuilder()
        .setName(sub.name)
        .setDescription(sub.description);

      if (sub.args) {
        const args = parseGrammar(sub.args);
        applyArgsToBuilder(subBuilder, args);
      }

      builder.addSubcommand(subBuilder);
    }

    body.push(builder.toJSON());
  }

  try {
    log.loading('Deploying slash commands...');
    // Deploy global for simplicity in this demo
    if (client.user) {
      await rest.put(Routes.applicationCommands(client.user.id), { body });
      log.success('Commands deployed successfully!');
    }
  } catch (error) {
    log.error('Deploy failed', error);
  }
}

function applyArgsToBuilder(builder: any, args: CommandArg[]) {
  for (const arg of args) {
    const setCommon = (opt: any) =>
      opt.setName(arg.name)
        .setDescription(`Argument: ${arg.name}`)
        .setRequired(!arg.optional);

    switch (arg.type) {
      case 'string':
      case 'auto':
        builder.addStringOption((opt: any) => {
          setCommon(opt);
          if (arg.type === 'auto') opt.setAutocomplete(true);
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

function checkPermissions(cmd: HybridCommand, member: any, user: any, guild: any): string | null {
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
      const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

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
    if (owners.includes(user.id)) return null;

    if (!member.permissions.has(cmd.permissions)) {
      return `⛔ You are missing the following permissions: \`${(cmd.permissions as any[]).join(', ')}\``;
    }
  }

  return null;
}

// --- RUNTIME HANDLERS ---

async function handleInteraction(interaction: Interaction) {
  if (interaction.isAutocomplete()) {
    const cmdName = interaction.commandName;
    const subName = interaction.options.getSubcommand(false);

    let cmd: HybridCommand | undefined;

    if (subName) {
      const group = subcommands.get(cmdName);
      cmd = group?.subcommands.get(subName);
    } else {
      cmd = commands.get(cmdName);
    }

    if (cmd && cmd.auto) {
      const ctx = new Context(
        interaction.client,
        interaction.user,
        interaction.member,
        interaction.guild,
        interaction.channel,
        {},
        interaction
      );
      await cmd.auto(ctx);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const cmdName = interaction.commandName;
  const subName = interaction.options.getSubcommand(false);

  let cmd: HybridCommand | undefined;

  if (subName) {
    const group = subcommands.get(cmdName);
    cmd = group?.subcommands.get(subName);
  } else {
    cmd = commands.get(cmdName);
  }

  if (!cmd) return;

  // Permission Check
  const error = checkPermissions(cmd, interaction.member, interaction.user, interaction.guild);
  if (error) {
    return interaction.reply({ content: error, ephemeral: true });
  }

  // Parse Args from Interaction
  const args: Record<string, any> = {};
  if (cmd.args) {
    const parsedArgs = parseGrammar(cmd.args);
    for (const arg of parsedArgs) {
      const val = interaction.options.get(arg.name)?.value;
      if (val !== undefined) {
        if (arg.type === 'user') {
          args[arg.name] = interaction.options.getUser(arg.name);
        } else {
          args[arg.name] = val;
        }
      }
    }
  }

  const ctx = new Context(
    interaction.client,
    interaction.user,
    interaction.member,
    interaction.guild,
    interaction.channel,
    args,
    interaction
  );

  // Log command execution
  const commandFullName = subName ? `${cmdName} ${subName}` : cmdName;
  log.command(commandFullName, interaction.user.tag, args);

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
  } catch (err) {
    log.error(`Error executing command: ${commandFullName}`, err);
    if (!interaction.replied) interaction.reply({ content: 'Error executing command', ephemeral: true });
  }
}

async function handleMessage(message: Message) {
  if (message.author.bot) return;

  const prefix = process.env.PREFIX || '!';
  if (!message.content.startsWith(prefix)) return;

  const rawContent = message.content.slice(prefix.length).trim();
  const parts = rawContent.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  if (parts.length === 0) return;

  const commandName = parts.shift()!.toLowerCase();

  // Check for normal command
  let cmd = commands.get(commandName);

  // If not found by name, check aliases
  if (!cmd) {
    for (const [name, command] of commands) {
      if (command.aliases && command.aliases.includes(commandName)) {
        cmd = command;
        break;
      }
    }
  }

  // Check for subcommand (e.g. !user info)
  let subCommandName: string | undefined;
  if (!cmd && subcommands.has(commandName)) {
    const group = subcommands.get(commandName);
    const subName = parts[0]?.toLowerCase();
    if (subName && group?.subcommands.has(subName)) {
      cmd = group.subcommands.get(subName);
      subCommandName = subName;
      parts.shift(); // consume subcommand name
    }
  }

  if (!cmd) return;
  if (cmd.type === 'slash') return; // Slash only

  // Permission Check
  const error = checkPermissions(cmd, message.member, message.author, message.guild);
  if (error) {
    return message.reply(error);
  }

  // Parse Prefix Args
  const args: Record<string, any> = {};
  if (cmd.args) {
    const parsedArgs = parseGrammar(cmd.args);

    for (let i = 0; i < parsedArgs.length; i++) {
      const argDef = parsedArgs[i];
      const rawArg = parts[i];

      if (argDef.rest) {
        // Rest argument consumes everything left
        const restContent = parts.slice(i).join(' ');
        if (restContent) args[argDef.name] = restContent;
        break;
      }

      if (!rawArg) {
        if (!argDef.optional) {
          return message.reply(`Missing required argument: \`${argDef.name}\``);
        }
        continue;
      }

      // Basic Type Conversion
      let value: any = rawArg.replace(/^"|"$/g, ''); // remove quotes

      if (argDef.type === 'number') {
        value = Number(value);
        if (isNaN(value)) return message.reply(`Argument \`${argDef.name}\` must be a number.`);
      } else if (argDef.type === 'user') {
        // Try to resolve user from mention or ID
        const idMatch = value.match(/^<@!?(\d+)>$/) || [null, value];
        const id = idMatch[1];
        try {
          const user = await message.client.users.fetch(id);
          value = user;
        } catch {
          return message.reply(`Invalid user for argument \`${argDef.name}\``);
        }
      } else if (argDef.type === 'boolean') {
        value = ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
      }

      args[argDef.name] = value;
    }
  }

  const ctx = new Context(
    message.client,
    message.author,
    message.member,
    message.guild,
    message.channel,
    args,
    message
  );

  // Log command execution
  const commandFullName = subCommandName ? `${commandName} ${subCommandName}` : commandName;
  log.command(commandFullName, message.author.tag, args);

  // Check cooldown
  const cooldownCheck = checkCooldown(commandFullName, message.author.id, cmd.cooldown);
  if (cooldownCheck.onCooldown) {
    return message.reply(`Please wait ${cooldownCheck.remaining.toFixed(1)} seconds before using this command again.`);
  }

  try {
    await cmd.run(ctx);
  } catch (err) {
    log.error(`Error executing command: ${commandFullName}`, err);
    message.reply('Error executing command.');
  }
}
