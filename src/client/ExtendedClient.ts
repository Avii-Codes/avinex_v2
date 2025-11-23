import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { registerConverterPlugin } from '../plugins/converter/register';
import { db } from '../database';
import { log } from '../utils/logger';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { BaseSystem } from '../systems/BaseSystem';

export class ExtendedClient extends SapphireClient {
    public systems: Map<string, BaseSystem> = new Map();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            loadMessageCommandListeners: false,
            defaultPrefix: process.env.PREFIX || '!',
            baseUserDirectory: null
        });
    }

    public async init() {
        try {
            // 1. Connect to Database
            if (process.env.MONGODB_URI) {
                await db.connect(process.env.MONGODB_URI);
            } else {
                log.warn('MONGODB_URI not found in .env, skipping database connection.');
            }

            // 2. Register Hybrid Command Plugin
            await registerConverterPlugin(this);

            // 3. Load Systems
            await this.loadSystems();

            // 4. Load Events
            await this.loadEvents();

            // 5. Login
            await this.login(process.env.DISCORD_TOKEN);

        } catch (error) {
            log.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    private async loadSystems() {
        const systemsPath = join(__dirname, '../systems');

        try {
            // Check if directory exists
            try {
                statSync(systemsPath);
            } catch {
                log.verbose('Systems directory not found, skipping system loading.');
                return;
            }

            const items = readdirSync(systemsPath);

            for (const item of items) {
                const itemPath = join(systemsPath, item);
                if (statSync(itemPath).isDirectory()) {
                    // Check if index.ts exists
                    // We need to check for both .ts and .js because of compilation
                    const files = readdirSync(itemPath);
                    const hasIndex = files.some(f => f.startsWith('index.'));

                    if (hasIndex) {
                        try {
                            const SystemClass = require(itemPath).default;
                            if (SystemClass && SystemClass.prototype instanceof BaseSystem) {
                                const system = new SystemClass();
                                await system.init(this);
                                this.systems.set(system.name, system);
                                log.success(`Loaded system: ${system.name}`);
                            }
                        } catch (error) {
                            log.error(`Failed to load system ${item}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            log.error('Failed to load systems:', error);
        }
    }

    private async loadEvents() {
        const eventsPath = join(__dirname, '../events');

        // Ensure directory exists
        try {
            const files = readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of files) {
                const filePath = join(eventsPath, file);
                const event = require(filePath).default;

                if (event.once) {
                    this.once(event.name, (...args) => event.execute(this, ...args));
                } else {
                    this.on(event.name, (...args) => event.execute(this, ...args));
                }

                log.info(`Loaded event: ${event.name}`);
            }
        } catch (error) {
            // Directory might not exist yet or be empty, which is fine for now
            log.verbose('No custom events found or events directory missing.');
        }
    }

    public async destroy() {
        await db.disconnect();
        await super.destroy();
    }
}
