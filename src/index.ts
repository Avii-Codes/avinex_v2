import 'dotenv/config';
import { ExtendedClient } from './client/ExtendedClient';
import { log } from './utils/logger';

const client = new ExtendedClient();

// Graceful Shutdown
const shutdown = async () => {
  log.info('\n🛑 Shutting down bot...');
  await client.destroy();
  log.success('✅ Bot disconnected. Exiting.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the bot
(async () => {
  client.init().catch(err => {
    log.error('Fatal error during initialization:', err);
    process.exit(1);
  });
})();
