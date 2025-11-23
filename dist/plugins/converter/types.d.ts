import { ChatInputCommandInteraction, Message, Client, User, GuildMember, Guild, TextBasedChannel, AutocompleteInteraction, APIInteractionGuildMember, PermissionResolvable } from 'discord.js';
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
export type PermissionLevel = 'User' | 'Admin' | 'ServerOwner' | 'Developer';
export interface HybridCommand {
    name: string;
    type?: CommandType;
    description: string;
    args?: string;
    aliases?: string[];
    permissions?: PermissionResolvable[];
    level?: PermissionLevel;
    cooldown?: number;
    run(ctx: HybridContext): Promise<void>;
    auto?(ctx: HybridContext): Promise<void>;
}
export interface SubCommandGroup {
    name: string;
    description: string;
    subcommands: Map<string, HybridCommand>;
}
//# sourceMappingURL=types.d.ts.map