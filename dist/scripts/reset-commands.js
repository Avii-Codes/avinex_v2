"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
async function resetCommands() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
        logger_1.log.error('DISCORD_TOKEN not found in .env');
        process.exit(1);
    }
    const rest = new discord_js_1.REST({ version: '10' }).setToken(token);
    try {
        logger_1.log.loading('Fetching Client ID...');
        const user = await rest.get(discord_js_1.Routes.user('@me'));
        const clientId = user.id;
        logger_1.log.success(`Found Client ID: ${clientId}`);
        logger_1.log.loading('Deleting all global application commands...');
        // Put empty array to overwrite all commands
        await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: [] });
        logger_1.log.success('Successfully deleted all commands.');
    }
    catch (error) {
        logger_1.log.error('Error resetting commands', error);
    }
}
resetCommands();
