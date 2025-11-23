"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const logger_1 = require("../utils/logger");
class BaseService {
    constructor() {
        // log.info(`Service loaded: ${this.name}`); // Cannot access abstract property in constructor
    }
    logLoaded() {
        logger_1.log.info(`Service loaded: ${this.name}`);
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map