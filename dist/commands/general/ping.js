"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const components_1 = require("../../lib/components");
const command = {
    name: 'ping',
    description: 'Check the bot\'s latency and status',
    type: 'both',
    async run(ctx) {
        // 1. Send initial "Pinging..." message
        await ctx.reply({ content: 'Pinging...' });
        // 2. Calculate stats
        const responseTime = Date.now() - ctx.raw.createdTimestamp;
        const apiLatency = Math.round(ctx.client.ws.ping);
        const uptime = formatUptime(ctx.client.uptime || 0);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        // 3. Build Container using Helper
        const container = new components_1.Container()
            .addText(`## <a:pong:1437528547995418795> **Pong!**`)
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`**<a:arrow:1437531356098728029> API Latency:** ${apiLatency}ms\n**<a:arrow:1437531356098728029> Response Time:** ${responseTime}ms`)
            .addText(`**<a:arrow:1437531356098728029> Uptime:** ${uptime}\n**<a:arrow:1437531356098728029> Memory:** ${memoryUsage} MB`);
        // 4. Edit the reply with the container
        await ctx.edit({
            content: '',
            components: [container],
            flags: [discord_js_1.MessageFlags.IsComponentsV2]
        });
    }
};
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
}
exports.default = command;
//# sourceMappingURL=ping.js.map