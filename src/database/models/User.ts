import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../types/database';

const UserSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    guildId: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    inventory: [{ type: String }],
    warnings: [{
        id: { type: String, required: true },
        reason: { type: String, required: true },
        moderatorId: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Compound index for unique user per guild
UserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
