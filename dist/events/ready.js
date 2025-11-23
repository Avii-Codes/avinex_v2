"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const discord_js_1 = require("discord.js");
exports.default = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger_1.log.success(`Logged in as ${client.user?.tag}!`);
        logger_1.log.info(`Ready to serve ${client.guilds.cache.size} guilds.`);
        client.user?.setActivity({
            name: 'Hybrid Commands',
            type: discord_js_1.ActivityType.Listening
        });
    }
};
//# sourceMappingURL=ready.js.map