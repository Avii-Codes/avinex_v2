import 'dotenv/config';
import { HybridClient } from './client';
import { displayBanner } from './utils/logger';

// Display Avinex banner
displayBanner();

const client = new HybridClient();

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Failed to login:', err);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down bot...');
  await client.destroy();
  console.log('✅ Bot disconnected. Exiting.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
