"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSystem = void 0;
const logger_1 = require("../utils/logger");
class BaseSystem {
    async init(client) {
        this.client = client;
        logger_1.log.info(`Initializing system: ${this.name}`);
        await this.onInit();
    }
}
exports.BaseSystem = BaseSystem;
//# sourceMappingURL=BaseSystem.js.map