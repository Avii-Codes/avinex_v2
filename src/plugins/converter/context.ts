import {
  ChatInputCommandInteraction,
  Message,
  Client,
  User,
  GuildMember,
  Guild,
  TextBasedChannel,
  APIInteractionGuildMember,
  AutocompleteInteraction
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

  public async reply(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean }) {
    const payload = typeof content === 'string' ? { content } : content;

    if (!this.raw && this.channel) {
      if ('send' in this.channel) {
        return (this.channel as any).send(payload);
      }
      return;
    }

    if (this.raw instanceof ChatInputCommandInteraction) {
      if (this.raw.replied || this.raw.deferred) {
        return this.raw.editReply(payload);
      }
      return this.raw.reply(payload);
    } else if (this.raw instanceof Message) {
      return this.raw.reply(payload);
    }
    // AutocompleteInteraction cannot reply
  }

  public async edit(content: string | { content?: string; embeds?: any[]; components?: any[] }) {
    // For virtual, we can't edit the "original response" easily unless we track it. 
    // For now, just send a new message or ignore.
    const payload = typeof content === 'string' ? { content } : content;

    if (!this.raw && this.channel) {
      if ('send' in this.channel) {
        return (this.channel as any).send(payload);
      }
      return;
    }

    if (this.raw instanceof ChatInputCommandInteraction) {
      return this.raw.editReply(payload);
    } else if (this.raw instanceof Message) {
      if (this.channel && 'send' in this.channel) {
        return (this.channel as any).send(payload);
      }
    }
  }

  public async follow(content: string | { content?: string; embeds?: any[]; components?: any[]; ephemeral?: boolean }) {
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
