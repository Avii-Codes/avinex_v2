import 'dotenv/config';
import { ExtendedClient } from './client/ExtendedClient';
import { displayBanner, log } from './utils/logger';

// Display Avinex banner
displayBanner();

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
client.init().catch(err => {
  log.error('Fatal error during initialization:', err);
  process.exit(1);
});
