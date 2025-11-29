import {
  ChatInputCommandInteraction,
  Message,
  Client,
  User,
  GuildMember,
  Guild,
  TextBasedChannel,
  APIInteractionGuildMember,
  AutocompleteInteraction,
  InteractionResponse,
  ButtonInteraction,
  StringSelectMenuInteraction,
  MessageFlags
} from 'discord.js';
import { HybridContext, HybridCommand } from './types';
import { StateManager } from '../router/state';

export class Context implements HybridContext {
  public client: Client;
  public user: User;
  public member: GuildMember | APIInteractionGuildMember | null;
  public guild: Guild | null;
  public channel: TextBasedChannel | null;
  public args: Record<string, any>;
  public raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null;
  public command: HybridCommand;
  public groupId: string;
  private response: Message | InteractionResponse | null = null;

  constructor(
    client: Client,
    user: User,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    channel: TextBasedChannel | null,
    args: Record<string, any>,
    raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null,
    command: HybridCommand
  ) {
    this.client = client;
    this.user = user;
    this.member = member;
    this.guild = guild;
    this.channel = channel;
    this.args = args;
    this.raw = raw;
    this.command = command;
    // Default: Generate a new group ID (for new commands)
    this.groupId = `grp_${Math.random().toString(16).slice(2, 10)}`;
  }

  /**
   * Create a component ID with optional state and TTL.
   * Automatically tracks message groups for batch cleanup.
   * 
   * @param key - Handler key (e.g., 'click', 'confirm')
   * @param data - State data to store
   * @param ttl - Time to live in seconds (default: 60)
   * @param messageGroupId - Optional group ID. Defaults to context's groupId.
   */
  public createId(key: string, data?: any, ttl: number = 60, messageGroupId?: string): string {
    const token = Math.random().toString(16).slice(2, 10);

    // Store data if provided
    if (data !== undefined) {
      // Use provided group ID or fall back to context's group ID
      const groupId = messageGroupId || this.groupId;

      // Inject metadata into state
      const stateData = {
        ...data,
        _token: token,
        _messageGroupId: groupId
      };

      StateManager.set(token, stateData, ttl);

      // Store this token in the group
      StateManager.addToGroup(groupId, token);
    }

    const id = `${this.command.name}:${key}:${token}`;

    if (id.length > 100) {
      throw new Error(`Custom ID length exceeded (${id.length}/100). Command '${this.command.name}' or Key '${key}' is too long.`);
    }

    return id;
  }

  /**
   * Generate a unique group ID for linking components.
   */
  public generateGroupId(): string {
    return `grp_${Math.random().toString(16).slice(2, 10)}`;
  }

  public async reply(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean; flags?: any }) {
    const payload = typeof content === 'string' ? { content } : content;

    if (!this.raw && this.channel) {
      if ('send' in this.channel) {
        this.response = await (this.channel as any).send(payload);
        return this.response;
      }
      return;
    }

    if (this.raw instanceof ChatInputCommandInteraction) {
      if (this.raw.replied || this.raw.deferred) {
        this.response = await this.raw.editReply(payload);
        return this.response;
      }
      this.response = await this.raw.reply(payload);
      return this.response;
    } else if (this.raw instanceof Message) {
      this.response = await this.raw.reply(payload);
      return this.response;
    }
    // AutocompleteInteraction cannot reply
  }

  public async edit(content: string | { content?: string; embeds?: any[]; components?: any[]; flags?: any }) {
    const payload = typeof content === 'string' ? { content } : content;

    if (this.response instanceof Message) {
      return this.response.edit(payload);
    }

    if (!this.raw && this.channel) {
      if ('send' in this.channel) {
        this.response = await (this.channel as any).send(payload);
        return this.response;
      }
      return;
    }

    if (this.raw instanceof ChatInputCommandInteraction) {
      return this.raw.editReply(payload);
    } else if (this.raw instanceof Message) {
      // Fallback if response wasn't tracked for some reason, though reply() should have set it.
      // But if we are here, it means we probably want to edit the *original* reply if possible.
      // Since we are tracking `this.response`, the first check `if (this.response instanceof Message)` should handle it.
      // If we are here, it means we don't have a tracked response, so we send a new one.
      if (this.channel && 'send' in this.channel) {
        this.response = await (this.channel as any).send(payload);
        return this.response;
      }
    }
  }

  public async follow(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean; flags?: any }) {
    const payload = typeof content === 'string' ? { content } : content;

    if (!this.raw && this.channel) {
      if ('send' in this.channel) {
        return (this.channel as any).send(payload);
      }
      return;
    }

    if (this.raw instanceof ChatInputCommandInteraction) {
      return this.raw.followUp(payload);
    } else if (this.raw instanceof Message) {
      return this.raw.reply(payload);
    }
  }


  /**
   * Register a message for auto-disabling components before TTL expires.
   * Static version for use outside of command context (e.g., global events).
   * 
   * @param message The message or interaction response to monitor
   * @param container The container to disable
   * @param ttl Time to live in seconds (default: 60)
   * @param interaction Optional interaction to use for editing (if available)
   */
  public static async registerAutoDisable(message: Message | InteractionResponse, container: any, ttl: number = 60, interaction?: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | any) {
    let targetMessage = message;

    // If it's an InteractionResponse, fetch the actual message to get the stable ID
    if (message instanceof InteractionResponse) {
      try {
        targetMessage = await message.fetch();
      } catch (error) {
        console.warn('[AutoDisable] Failed to fetch message from InteractionResponse, using original ID (might cause timer duplication):', error);
      }
    }

    StateManager.monitorMessage(targetMessage.id, async () => {
      try {
        // Disable all components
        container.disable();

        // Try to edit the message
        if (targetMessage instanceof Message) {
          await targetMessage.edit({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
          });
        } else {
          // Fallback for InteractionResponse if fetch failed but we still have the object
          // Check if the raw context is an interaction that can edit replies
          if (interaction && 'editReply' in interaction) {
            await (interaction as any).editReply({
              components: [container],
              flags: [MessageFlags.IsComponentsV2]
            });
          } else if (message.edit) { // Use original message object's edit if available
            // Fallback if message has edit method (some InteractionResponses do)
            // @ts-ignore
            await message.edit({
              components: [container],
              flags: [MessageFlags.IsComponentsV2]
            });
          }
        }
      } catch (error: any) {
        // Ignore common "gone" errors
        if (error.code === 10008) return; // Unknown Message (Deleted)
        if (error.code === 10062) return; // Unknown Interaction (Expired Ephemeral)

        console.error('[AutoDisable] Failed to disable components:', error);
      }
    }, ttl);
  }

  /**
   * Instance wrapper for registerAutoDisable
   */
  public async registerAutoDisable(message: Message | InteractionResponse, container: any, ttl: number = 60) {
    await Context.registerAutoDisable(message, container, ttl, this.raw);
  }
}
