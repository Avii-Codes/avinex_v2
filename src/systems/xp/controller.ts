import { XPManager } from './manager';

export class XPController {
    private manager: XPManager;

    constructor(manager: XPManager) {
        this.manager = manager;
    }

    public async addXP(userId: string, guildId: string, amount: number) {
        return this.manager.addXP(userId, guildId, amount);
    }

    public async getLevel(userId: string, guildId: string) {
        return this.manager.getLevel(userId, guildId);
    }
}
