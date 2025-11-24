import { UserModel } from '../../database/models/User';
import { log } from '../../utils/logger';

export class XPManager {
    public async addXP(userId: string, guildId: string, amount: number): Promise<void> {
        try {
            let user = await UserModel.findOne({ userId, guildId });

            if (!user) {
                user = new UserModel({ userId, guildId });
            }

            user.xp += amount;

            // Simple level up logic: Level = sqrt(XP) * 0.1
            const newLevel = Math.floor(Math.sqrt(user.xp) * 0.1);

            if (newLevel > user.level) {
                user.level = newLevel;
                log.info(`User ${userId} leveled up to ${newLevel} in guild ${guildId}`);
                // Emit level up event here in future
            }

            await user.save();
        } catch (error) {
            log.error('Error adding XP:', error);
        }
    }

    public async getLevel(userId: string, guildId: string): Promise<number> {
        const user = await UserModel.findOne({ userId, guildId });
        return user ? user.level : 0;
    }
}


