import {
  Client,
  Events,
  Interaction,
  Message,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  PermissionsBitField
} from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parseGrammar } from './grammar';
import { CommandArg, HybridCommand } from './types';
import { configManager } from '../../utils/config';
import { log } from '../../utils/logger';
import { registry } from './registry';
import { executeHybridCommand } from './execution';

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
            // This is a ROOT COMMAND (e.g. 'user') inside a category
            const rootName = catFile;
            const rootPath = catFilePath;

            // Register Root Collection
            registry.registerRoot({
              name: rootName,
              description: `Commands for ${rootName}`,
              subcommands: new Map(),
              groups: new Map()
            });

            // Scan Root Folder
            const rootFiles = readdirSync(rootPath);
            for (const rootFile of rootFiles) {
              const rootFilePath = join(rootPath, rootFile);
              const rootStat = statSync(rootFilePath);

              if (rootStat.isDirectory()) {
                // This is a NESTED GROUP (e.g. 'settings') inside a root
                const groupName = rootFile;
                const groupPath = rootFilePath;

                // Register Group under Root
                registry.registerGroup(rootName, {
                  name: groupName,
                  description: `Commands for ${groupName}`,
                  subcommands: new Map()
                });

                // Load subcommands for this group
                // We pass "Root/Group" as the parentGroup identifier
                const subCount = loadSubcommands(groupPath, `${rootName}/${groupName}`, categoryName);
                commandCount += subCount;

              } else if (rootFile.endsWith('.ts') || rootFile.endsWith('.js')) {
                // This is a DIRECT SUBCOMMAND of the root
                if (loadSingleCommand(rootFilePath, categoryName, rootName)) {
                  commandCount++;
                }
              }
            }

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
    process.exit(1);
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

    if (!cmd) return false;

    // Validate Command
    const validationError = validateCommand(cmd, path);
    if (validationError) {
      log.error(`[FATAL] Invalid command at ${path}: ${validationError}`);
      process.exit(1);
    }

    registry.register(cmd, path, categoryName, parentGroup);
    return true;
  } catch (e) {
    log.error(`Failed to load command at ${path}`, e);
    process.exit(1);
  }
}

function validateCommand(cmd: HybridCommand, path: string): string | null {
  if (!cmd.name) return 'Missing "name" property.';
  if (!/^[\w-]{1,32}$/.test(cmd.name)) return 'Name must be 1-32 characters, alphanumeric/dashes only (lowercase recommended).';

  if (!cmd.description) return 'Missing "description" property.';
  if (cmd.description.length < 1 || cmd.description.length > 100) return 'Description must be between 1 and 100 characters.';

  if (!cmd.run || typeof cmd.run !== 'function') return 'Missing "run" function.';

  return null;
}

// --- RUNTIME HANDLERS ---

async function handleInteraction(interaction: Interaction) {
  if (interaction.isAutocomplete()) {
    await executeHybridCommand(interaction, true);
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  await executeHybridCommand(interaction);
}

async function handleMessage(message: Message) {
  if (message.author.bot) return;
  await executeHybridCommand(message);
}

async function deployCommands(client: Client) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  const body: any[] = [];

  // Top-level commands
  for (const cmd of registry.getAll()) {
    if (cmd.type === 'prefix') continue; // Skip prefix-only

    try {
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
    } catch (e: any) {
      log.error(`Failed to build slash command "${cmd.name}": ${e.message}`);
      continue; // Skip invalid command but continue deploying others
    }
  }

  // Subcommands (Roots)
  for (const root of registry.getAllRoots()) {
    try {
      const builder = new SlashCommandBuilder()
        .setName(root.name)
        .setDescription(root.description);

      // 1. Direct Subcommands (/root sub)
      for (const sub of root.subcommands.values()) {
        const subBuilder = new SlashCommandSubcommandBuilder()
          .setName(sub.name)
          .setDescription(sub.description);

        if (sub.args) {
          const args = parseGrammar(sub.args);
          applyArgsToBuilder(subBuilder, args);
        }

        builder.addSubcommand(subBuilder);
      }

      // 2. Nested Groups (/root group sub)
      for (const group of root.groups.values()) {
        // We need a SubcommandGroupBuilder here, but djs uses a method on the main builder
        // .addSubcommandGroup(group => group.setName()...)

        builder.addSubcommandGroup(groupBuilder => {
          groupBuilder
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

            groupBuilder.addSubcommand(subBuilder);
          }
          return groupBuilder;
        });
      }

      body.push(builder.toJSON());
    } catch (e: any) {
      log.error(`Failed to build root command "${root.name}": ${e.message}`);
      continue;
    }
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
