export interface IGuild {
    guildId: string;
    prefix: string;
    settings: {
        moderation: {
            automod: boolean;
            logChannelId?: string;
            moderatorRoles?: string[];
            moderatorUsers?: string[];
        };
        xp: {
            enabled: boolean;
            multiplier: number;
            levelUpMessage: boolean;
        };
        economy: {
            currency: string;
            symbol: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    userId: string;
    guildId: string;
    xp: number;
    level: number;
    coins: number;
    inventory: string[];
    warnings: {
        id: string;
        reason: string;
        moderatorId: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
