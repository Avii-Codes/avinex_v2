import { HybridCommand } from '../../plugins/converter/types';
import { Container } from '../../lib/components';
import { MessageFlags } from 'discord.js';
import { TextDisplayBuilder, ButtonStyle } from 'discord.js';
const command: HybridCommand = {
    name: 'test',
    description: 'testing things out',
    type: 'both',
    level: 'Developer',

    async run(ctx) {


        const container = new Container()
            // Header
            .addText('## 🎮 Music Player Dashboard')
            .addSeparator({ spacing: 'small', divider: true })

            // Now Playing Section with Thumbnail
            .addSection({
                texts: [
                    '**Now Playing:** Song Title',
                    '**Artist:** Artist Name',
                    '**Duration:** 3:45 / 5:30'
                ],
                accessory: {
                    type: 'thumbnail',
                    url: 'https://example.com/album-cover.png'
                }
            })
            .addSeparator({ spacing: 'large' })

            // Playback Controls (Buttons)
            .addActionRow({
                buttons: [
                    { label: 'Previous', customId: 'prev', emoji: '⏮️', style: ButtonStyle.Secondary },
                    { label: 'Play', customId: 'play', emoji: '▶️', style: ButtonStyle.Success },
                    { label: 'Pause', customId: 'pause', emoji: '⏸️', style: ButtonStyle.Primary, disabled: true },
                    { label: 'Next', customId: 'next', emoji: '⏭️', style: ButtonStyle.Secondary },
                    { label: 'Stop', customId: 'stop', emoji: '⏹️', style: ButtonStyle.Danger }
                ]
            })

            // Volume & Settings
            .addActionRow({
                buttons: [
                    { label: 'Volume Down', customId: 'vol_down', emoji: '🔉', style: ButtonStyle.Secondary },
                    { label: 'Volume Up', customId: 'vol_up', emoji: '🔊', style: ButtonStyle.Secondary },
                    { label: 'Settings', customId: 'settings', emoji: '⚙️', style: ButtonStyle.Secondary }
                ]
            })

            // Queue Selection
            .addActionRow({
                menu: {
                    type: 'string',
                    customId: 'queue_select',
                    placeholder: 'Jump to song in queue',
                    options: [
                        { label: 'Song 1', value: '1', description: 'Next in queue', emoji: '🎵' },
                        { label: 'Song 2', value: '2', description: 'Track 2', emoji: '🎵' },
                        { label: 'Song 3', value: '3', description: 'Track 3', emoji: '🎵' }
                    ],
                    minValues: 1,
                    maxValues: 1
                }
            })

            .addSeparator({ spacing: 'small', divider: true })

            // Stats & Info Section with Button
            .addSection({
                texts: [
                    '**Queue:** 15 songs',
                    '**Total Duration:** 1:23:45',
                    '**Listeners:** 42 users'
                ],
                accessory: {
                    type: 'button',
                    label: 'View Full Queue',
                    customId: 'view_queue',
                    emoji: '📋',
                    style: ButtonStyle.Primary
                }
            })

            // Image Gallery
            .addMedia([
                { url: 'https://example.com/visual1.png', description: 'Visualizer 1' },
                { url: 'https://example.com/visual2.png', description: 'Visualizer 2' }
            ])

            .addSeparator({ spacing: 'large' })

            // Links & External Actions
            .addActionRow({
                buttons: [
                    { label: 'Spotify', url: 'https://spotify.com/track/...', emoji: '🎧' },
                    { label: 'YouTube', url: 'https://youtube.com/watch?v=...', emoji: '▶️' }
                ]
            });



        // const { arg } = ctx.args;
        await ctx.reply({
            content: '',
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
};

export default command;
