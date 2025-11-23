"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridClient = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const register_1 = require("./plugins/converter/register");
class HybridClient extends framework_1.SapphireClient {
    constructor() {
        super({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildMembers
            ],
            loadMessageCommandListeners: false, // We handle this ourselves
            defaultPrefix: process.env.PREFIX || '!',
            baseUserDirectory: null // Disable automatic piece loading since we handle it manually
        });
    }
    async login(token) {
        // Register our custom plugin
        await (0, register_1.registerConverterPlugin)(this);
        return super.login(token);
    }
}
exports.HybridClient = HybridClient;
//# sourceMappingURL=client.js.map