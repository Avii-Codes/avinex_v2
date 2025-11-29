import {
  ChatInputCommandInteraction,
  Message,
  Client,
  User,
  GuildMember,
  Guild,
  TextBasedChannel,
  AutocompleteInteraction,
  APIInteractionGuildMember,
  PermissionResolvable,
  ButtonInteraction,
  StringSelectMenuInteraction
} from 'discord.js';

export type CommandType = 'slash' | 'prefix' | 'both';

export interface CommandArg {
  name: string;
  type: 'string' | 'number' | 'user' | 'boolean' | 'channel' | 'role' | 'auto';
  optional: boolean;
  rest: boolean;
}

export interface HybridContext {
  client: Client;
  user: User;
  member: GuildMember | APIInteractionGuildMember | null;
  guild: Guild | null;
  channel: TextBasedChannel | null;
  args: Record<string, any>;
  raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null;

  reply(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean; flags?: any; files?: any[] }): Promise<any>;
  edit(content: string | { content?: string; embeds?: any[]; components?: any[]; flags?: any; files?: any[] }): Promise<any>;
  follow(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean; flags?: any; files?: any[] }): Promise<any>;

  // Router Plugin Extensions
  command: HybridCommand;
  createId(key: string, data?: any, ttl?: number, messageGroupId?: string): string;
  generateGroupId(): string;
  registerAutoDisable(message: any, container: any, ttl?: number): void;
}

export interface ComponentContext extends HybridContext {
  interaction: ButtonInteraction | StringSelectMenuInteraction | any;
  state: any; // Hydrated from cache
  componentArgs: string[]; // Raw args
  groupId?: string; // Synced from state
}

export interface ComponentConfig {
  run: (ctx: ComponentContext) => Promise<void>;
  global?: boolean;
  permissions?: PermissionResolvable[];
  roles?: string[]; // Role IDs
  users?: string[]; // User IDs
  ownerOnly?: boolean;
  cooldown?: number;
}

// Type for component handlers - can be either a function or a config object
export type ComponentHandler = ((ctx: ComponentContext) => Promise<void>) | ComponentConfig;

export type PermissionLevel = 'User' | 'Admin' | 'ServerOwner' | 'Developer';

export interface HybridCommand {
  name: string;
  type?: CommandType;
  description: string;
  args?: string; // Grammar string like "<user:user> <reason...?>"
  aliases?: string[];
  permissions?: PermissionResolvable[];
  level?: PermissionLevel;
  cooldown?: number; // in seconds

  run(ctx: HybridContext): Promise<void>;
  auto?(ctx: HybridContext): Promise<void>; // For autocomplete

  // Router Plugin Extensions
  components?: Record<string, ComponentHandler>;
  idPrefix?: string; // Internal use by Router
}

export interface SubCommandGroup {
  name: string;
  description: string;
  subcommands: Map<string, HybridCommand>;
}

export interface RootCommandCollection {
  name: string;
  description: string;
  subcommands: Map<string, HybridCommand>; // Direct subcommands: /root sub
  groups: Map<string, SubCommandGroup>;    // Nested groups: /root group sub
}
