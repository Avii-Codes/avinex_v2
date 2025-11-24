import { GuildMember } from 'discord.js';
export declare class GuildPermissions {
    /**
     * Check if user is an admin in this guild
     * Checks: Guild config admin roles/users → Discord Admin permission → Owner
     */
    static isAdmin(guildId: string, member: GuildMember | null): Promise<boolean>;
    /**
     * Check if user is a moderator in this guild
     * Checks: Guild config moderator roles/users
     */
    static isModerator(guildId: string, member: GuildMember | null): Promise<boolean>;
}
//# sourceMappingURL=guildPermissions.d.ts.map