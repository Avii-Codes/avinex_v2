import mongoose, { Schema } from 'mongoose';
import { IGuild } from '../../types/database';

const GuildSchema: Schema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    prefix: { type: String, default: process.env.PREFIX || '!' },
    settings: {
        moderation: {
            automod: { type: Boolean, default: false },
            logChannelId: { type: String }
        },
        xp: {
            enabled: { type: Boolean, default: true },
            multiplier: { type: Number, default: 1 },
            levelUpMessage: { type: Boolean, default: true }
        },
        economy: {
            currency: { type: String, default: 'Coins' },
            symbol: { type: String, default: '🪙' }
        }
    }
}, {
    timestamps: true
});

export const GuildModel = mongoose.model<IGuild>('Guild', GuildSchema);
