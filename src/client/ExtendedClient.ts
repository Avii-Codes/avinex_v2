import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { registerConverterPlugin } from '../plugins/converter/register';
import { db } from '../database';
import { log, animateBanner } from '../utils/logger';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { BaseService } from '../services/BaseService';
import { BaseSystem } from '../systems/BaseSystem';

export class ExtendedClient extends SapphireClient {
    public systems: Map<string, BaseSystem> = new Map();
    public services: Map<string, BaseService> = new Map();

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
            // 0. Animate Banner
            await animateBanner();

            // 1. Connect to Database
            if (process.env.MONGODB_URI) {
                await db.connect(process.env.MONGODB_URI);
            } else {
                log.warn('MONGODB_URI not found in .env, skipping database connection.');
            }

            // 2. Register Hybrid Command Plugin
            await registerConverterPlugin(this);

            // 2.5. Register Router Plugin
            const { registerRouterPlugin } = require('../plugins/router');
            registerRouterPlugin(this);

            // 3. Load Services
            await this.loadServices();

            // 4. Load Systems
            await this.loadSystems();

            // 5. Load Events
            await this.loadEvents();

            // 6. Login
            await this.login(process.env.DISCORD_TOKEN);

        } catch (error) {
            log.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    private async loadServices() {
        const servicesPath = join(__dirname, '../services');

        try {
            // Check if directory exists
            try {
                statSync(servicesPath);
            } catch {
                log.verbose('Services directory not found, skipping service loading.');
                return;
            }

            const items = readdirSync(servicesPath);

            for (const item of items) {
                const itemPath = join(servicesPath, item);
                if (statSync(itemPath).isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
                    // Skip BaseService
                    if (item.startsWith('BaseService')) continue;

                    try {
                        const ServiceClass = require(itemPath).default;
                        if (ServiceClass && ServiceClass.prototype instanceof BaseService) {
                            const service = new ServiceClass();
                            this.services.set(service.name, service);
                            // Call logLoaded via protected method access (or just log here)
                            log.success(`Loaded service: ${service.name}`);
                        }
                    } catch (error) {
                        log.error(`Failed to load service ${item}:`, error);
                    }
                }
            }
        } catch (error) {
            log.error('Failed to load services:', error);
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
