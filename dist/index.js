"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("./client");
const logger_1 = require("./utils/logger");
// Display Avinex banner
(0, logger_1.displayBanner)();
const client = new client_1.HybridClient();
client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Failed to login:', err);
});
