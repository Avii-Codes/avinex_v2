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
  InteractionResponse
} from 'discord.js';
import { HybridContext } from './types';

export class Context implements HybridContext {
  public client: Client;
  public user: User;
  public member: GuildMember | APIInteractionGuildMember | null;
  public guild: Guild | null;
  public channel: TextBasedChannel | null;
  public args: Record<string, any>;
  public raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null;
  private response: Message | InteractionResponse | null = null;

  constructor(
    client: Client,
    user: User,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    channel: TextBasedChannel | null,
    args: Record<string, any>,
    raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null
  ) {
    this.client = client;
    this.user = user;
    this.member = member;
    this.guild = guild;
    this.channel = channel;
    this.args = args;
    this.raw = raw;
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
}
