import { Events } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';
import { log } from '../utils/logger';
import { deployCommands } from '../plugins/converter/register';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: ExtendedClient) {
        // 1. Log Login
        log.success(`Logged in as ${client.user?.tag}`);

        // 3. Deploy Commands
        await deployCommands(client);

        // 4. Set Activity
        client.user?.setActivity('Hybrid Commands | /help');
    },
};
