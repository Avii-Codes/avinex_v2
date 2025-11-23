"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = require("./logger");
class ErrorHandler {
    static handle(error, context) {
        logger_1.log.error(`[${context}] An error occurred:`, error);
        // Future: Integration with Sentry or other error tracking services
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map