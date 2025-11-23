"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const ExtendedClient_1 = require("./client/ExtendedClient");
const logger_1 = require("./utils/logger");
// Display Avinex banner
(0, logger_1.displayBanner)();
const client = new ExtendedClient_1.ExtendedClient();
// Graceful Shutdown
const shutdown = async () => {
    logger_1.log.info('\n🛑 Shutting down bot...');
    await client.destroy();
    logger_1.log.success('✅ Bot disconnected. Exiting.');
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// Start the bot
client.init().catch(err => {
    logger_1.log.error('Fatal error during initialization:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map