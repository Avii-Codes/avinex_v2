import { XPManager } from './manager';
export declare class XPController {
    private manager;
    constructor(manager: XPManager);
    addXP(userId: string, guildId: string, amount: number): Promise<void>;
    getLevel(userId: string, guildId: string): Promise<number>;
}
//# sourceMappingURL=controller.d.ts.map