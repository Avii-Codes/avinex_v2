import 'dotenv/config';
import { HybridClient } from './client';
import { displayBanner } from './utils/logger';

// Display Avinex banner
displayBanner();

const client = new HybridClient();

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Failed to login:', err);
});
