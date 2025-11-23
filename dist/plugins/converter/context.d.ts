import { ChatInputCommandInteraction, Message, Client, User, GuildMember, Guild, TextBasedChannel, APIInteractionGuildMember, AutocompleteInteraction } from 'discord.js';
import { HybridContext } from './types';
export declare class Context implements HybridContext {
    client: Client;
    user: User;
    member: GuildMember | APIInteractionGuildMember | null;
    guild: Guild | null;
    channel: TextBasedChannel | null;
    args: Record<string, any>;
    raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null;
    constructor(client: Client, user: User, member: GuildMember | APIInteractionGuildMember | null, guild: Guild | null, channel: TextBasedChannel | null, args: Record<string, any>, raw: Message | ChatInputCommandInteraction | AutocompleteInteraction | null);
    reply(content: string | {
        content?: string;
        embeds?: any[];
        components?: any[];
        ephemeral?: boolean;
    }): Promise<any>;
    edit(content: string | {
        content?: string;
        embeds?: any[];
        components?: any[];
    }): Promise<any>;
    follow(content: string | {
        content?: string;
        embeds?: any[];
        components?: any[];
        ephemeral?: boolean;
    }): Promise<any>;
}
//# sourceMappingURL=context.d.ts.map