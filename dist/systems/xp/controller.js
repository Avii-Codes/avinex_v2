"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XPController = void 0;
class XPController {
    constructor(manager) {
        this.manager = manager;
    }
    async addXP(userId, guildId, amount) {
        return this.manager.addXP(userId, guildId, amount);
    }
    async getLevel(userId, guildId) {
        return this.manager.getLevel(userId, guildId);
    }
}
exports.XPController = XPController;
//# sourceMappingURL=controller.js.map