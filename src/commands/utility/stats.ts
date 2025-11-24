import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags, version as djsVersion } from 'discord.js';
import os from 'os';

const command: HybridCommand = {
    name: 'stats',
    description: 'View bot, system, and server statistics',
    type: 'both',
    async run(ctx) {
        const guild = ctx.guild;

        // Bot Statistics
        const botUptime = formatUptime(ctx.client.uptime || 0);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const apiLatency = Math.round(ctx.client.ws.ping);
        const totalServers = ctx.client.guilds.cache.size;
        const totalUsers = ctx.client.users.cache.size;

        // System Statistics
        const platform = os.platform();
        const cpuCores = os.cpus().length;
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMemory = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2);
        const memoryPercent = (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1);
        const systemUptime = formatUptime(os.uptime() * 1000);

        const container = new Container()
            .setColor('#5865F2')
            .addText('## 📊 Statistics Dashboard')
            .addSeparator({ spacing: 'small', divider: true })
            .addText('### 🤖 Bot Status')
            .addText([
                `**Uptime:** ${botUptime}`,
                `**Memory:** ${memoryUsage} MB`,
                `**Latency:** ${apiLatency}ms`,
                `**Servers:** ${totalServers} | **Users:** ${totalUsers}`
            ].join('\n'))
            .addSeparator({ spacing: 'large' })
            .addText('### 🖥️ System Resources')
            .addText([
                `**OS:** ${getPlatformName(platform)}`,
                `**CPU Cores:** ${cpuCores}`,
                `**RAM:** ${usedMemory} GB / ${totalMemory} GB (${memoryPercent}%)`,
                `**System Uptime:** ${systemUptime}`
            ].join('\n'));

        // Server Stats Section (only if in a guild)
        if (guild) {
            const memberCount = guild.memberCount;
            const channelCount = guild.channels.cache.size;
            const roleCount = guild.roles.cache.size;
            const createdAt = Math.floor(guild.createdTimestamp / 1000);

            container
                .addSeparator({ spacing: 'large' })
                .addText('### 🏰 Server Info')
                .addText([
                    `**Name:** ${guild.name}`,
                    `**Members:** ${memberCount.toLocaleString()}`,
                    `**Channels:** ${channelCount} | **Roles:** ${roleCount}`,
                    `**Created:** <t:${createdAt}:R>`
                ].join('\n'));
        }

        container
            .addSeparator({ spacing: 'small', divider: true })
            .addText(`*Updated: <t:${Math.floor(Date.now() / 1000)}:R>*`);

        await ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

function formatUptime(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}

function getPlatformName(platform: string): string {
    const platforms: Record<string, string> = {
        'win32': 'Windows',
        'darwin': 'macOS',
        'linux': 'Linux',
        'freebsd': 'FreeBSD',
        'openbsd': 'OpenBSD',
        'aix': 'AIX',
        'sunos': 'SunOS'
    };
    return platforms[platform] || platform;
}

export default command;
