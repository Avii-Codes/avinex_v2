"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPManager = void 0;
const User_1 = require("../../database/models/User");
const logger_1 = require("../../utils/logger");
class XPManager {
    async addXP(userId, guildId, amount) {
        try {
            let user = await User_1.UserModel.findOne({ userId, guildId });
            if (!user) {
                user = new User_1.UserModel({ userId, guildId });
            }
            user.xp += amount;
            // Simple level up logic: Level = sqrt(XP) * 0.1
            const newLevel = Math.floor(Math.sqrt(user.xp) * 0.1);
            if (newLevel > user.level) {
                user.level = newLevel;
                logger_1.log.info(`User ${userId} leveled up to ${newLevel} in guild ${guildId}`);
                // Emit level up event here in future
            }
            await user.save();
        }
        catch (error) {
            logger_1.log.error('Error adding XP:', error);
        }
    }
    async getLevel(userId, guildId) {
        const user = await User_1.UserModel.findOne({ userId, guildId });
        return user ? user.level : 0;
    }
}
exports.XPManager = XPManager;
//# sourceMappingURL=manager.js.map