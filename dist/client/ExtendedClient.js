"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedClient = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const register_1 = require("../plugins/converter/register");
const database_1 = require("../database");
const logger_1 = require("../utils/logger");
const fs_1 = require("fs");
const path_1 = require("path");
const BaseSystem_1 = require("../systems/BaseSystem");
class ExtendedClient extends framework_1.SapphireClient {
    constructor() {
        super({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers
            ],
            loadMessageCommandListeners: false,
            defaultPrefix: process.env.PREFIX || '!',
            baseUserDirectory: null
        });
        this.systems = new Map();
    }
    async init() {
        try {
            // 1. Connect to Database
            if (process.env.MONGODB_URI) {
                await database_1.db.connect(process.env.MONGODB_URI);
            }
            else {
                logger_1.log.warn('MONGODB_URI not found in .env, skipping database connection.');
            }
            // 2. Register Hybrid Command Plugin
            await (0, register_1.registerConverterPlugin)(this);
            // 3. Load Systems
            await this.loadSystems();
            // 4. Load Events
            await this.loadEvents();
            // 5. Login
            await this.login(process.env.DISCORD_TOKEN);
        }
        catch (error) {
            logger_1.log.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }
    async loadSystems() {
        const systemsPath = (0, path_1.join)(__dirname, '../systems');
        try {
            // Check if directory exists
            try {
                (0, fs_1.statSync)(systemsPath);
            }
            catch {
                logger_1.log.verbose('Systems directory not found, skipping system loading.');
                return;
            }
            const items = (0, fs_1.readdirSync)(systemsPath);
            for (const item of items) {
                const itemPath = (0, path_1.join)(systemsPath, item);
                if ((0, fs_1.statSync)(itemPath).isDirectory()) {
                    // Check if index.ts exists
                    // We need to check for both .ts and .js because of compilation
                    const files = (0, fs_1.readdirSync)(itemPath);
                    const hasIndex = files.some(f => f.startsWith('index.'));
                    if (hasIndex) {
                        try {
                            const SystemClass = require(itemPath).default;
                            if (SystemClass && SystemClass.prototype instanceof BaseSystem_1.BaseSystem) {
                                const system = new SystemClass();
                                await system.init(this);
                                this.systems.set(system.name, system);
                                logger_1.log.success(`Loaded system: ${system.name}`);
                            }
                        }
                        catch (error) {
                            logger_1.log.error(`Failed to load system ${item}:`, error);
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.log.error('Failed to load systems:', error);
        }
    }
    async loadEvents() {
        const eventsPath = (0, path_1.join)(__dirname, '../events');
        // Ensure directory exists
        try {
            const files = (0, fs_1.readdirSync)(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
            for (const file of files) {
                const filePath = (0, path_1.join)(eventsPath, file);
                const event = require(filePath).default;
                if (event.once) {
                    this.once(event.name, (...args) => event.execute(this, ...args));
                }
                else {
                    this.on(event.name, (...args) => event.execute(this, ...args));
                }
                logger_1.log.info(`Loaded event: ${event.name}`);
            }
        }
        catch (error) {
            // Directory might not exist yet or be empty, which is fine for now
            logger_1.log.verbose('No custom events found or events directory missing.');
        }
    }
    async destroy() {
        await database_1.db.disconnect();
        await super.destroy();
    }
}
exports.ExtendedClient = ExtendedClient;
//# sourceMappingURL=ExtendedClient.js.map