import 'dotenv/config';
import { REST, Routes, APIUser } from 'discord.js';
import { log } from '../utils/logger';

async function resetCommands() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        log.error('DISCORD_TOKEN not found in .env');
        process.exit(1);
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        log.loading('Fetching Client ID...');
        const user = await rest.get(Routes.user('@me')) as APIUser;
        const clientId = user.id;
        log.success(`Found Client ID: ${clientId}`);

        log.loading('Deleting all global application commands...');

        // Put empty array to overwrite all commands
        await rest.put(Routes.applicationCommands(clientId), { body: [] });

        log.success('Successfully deleted all commands.');
    } catch (error) {
        log.error('Error resetting commands', error);
    }
}

resetCommands();
