import { ExtendedClient } from '../client/ExtendedClient';
import { log } from '../utils/logger';
import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    async execute(client: ExtendedClient) {
        log.success(`Logged in as ${client.user?.tag}!`);
        log.info(`Ready to serve ${client.guilds.cache.size} guilds.`);

        client.user?.setActivity({
            name: 'Hybrid Commands',
            type: ActivityType.Listening
        });
    }
};
