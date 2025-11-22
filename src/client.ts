import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { registerConverterPlugin } from './plugins/converter/register';

export class HybridClient extends SapphireClient {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      loadMessageCommandListeners: false, // We handle this ourselves
      defaultPrefix: process.env.PREFIX || '!',
      baseUserDirectory: null // Disable automatic piece loading since we handle it manually
    });
  }

  public override async login(token?: string) {
    // Register our custom plugin
    await registerConverterPlugin(this);
    return super.login(token);
  }
}
