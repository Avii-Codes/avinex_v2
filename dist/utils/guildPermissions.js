"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildPermissions = void 0;
const Guild_1 = require("../database/models/Guild");
class GuildPermissions {
    /**
     * Check if user is an admin in this guild
     * Checks: Guild config admin roles/users → Discord Admin permission → Owner
     */
    static async isAdmin(guildId, member) {
        if (!member)
            return false;
        // Check if server owner
        if (member.guild.ownerId === member.id)
            return true;
        // Check Discord admin permission
        if (member.permissions.has('Administrator'))
            return true;
        // Check guild-specific config
        const guild = await Guild_1.GuildModel.findOne({ guildId });
        if (!guild?.permissions)
            return false;
        // Check if user ID is in admin users
        if (guild.permissions.adminUsers?.includes(member.id))
            return true;
        // Check if user has any admin role
        const hasAdminRole = member.roles.cache.some(role => guild.permissions?.adminRoles?.includes(role.id));
        return hasAdminRole;
    }
    /**
     * Check if user is a moderator in this guild
     * Checks: Guild config moderator roles/users
     */
    static async isModerator(guildId, member) {
        if (!member)
            return false;
        // Admins are also moderators
        if (await this.isAdmin(guildId, member))
            return true;
        // Check guild-specific config
        const guild = await Guild_1.GuildModel.findOne({ guildId });
        if (!guild?.permissions)
            return false;
        // Check if user ID is in moderator users
        if (guild.permissions.moderatorUsers?.includes(member.id))
            return true;
        // Check if user has any moderator role
        const hasModeratorRole = member.roles.cache.some(role => guild.permissions?.moderatorRoles?.includes(role.id));
        return hasModeratorRole;
    }
}
exports.GuildPermissions = GuildPermissions;
//# sourceMappingURL=guildPermissions.js.map