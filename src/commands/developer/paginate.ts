import { HybridCommand, ComponentContext } from '../../plugins/converter/types';
import { MessageFlags } from 'discord.js';
import { Container } from '../../lib/components';

const ITEMS_PER_PAGE = 5;

const command: HybridCommand = {
    name: 'paginate',
    description: 'Test pagination with state',
    run: async (ctx) => {
        // Generate sample items
        const items = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
            description: `This is item number ${i + 1}`
        }));

        showPage(ctx, items, 0, false);
    },

    components: {
        next: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Pagination expired',
                    ephemeral: true
                });
            }

            const { items, page } = ctx.state;
            const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;
            const newPage = Math.min(page + 1, maxPage);

            showPage(ctx, items, newPage, true);
        },

        prev: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Pagination expired',
                    ephemeral: true
                });
            }

            const { items, page } = ctx.state;
            const newPage = Math.max(page - 1, 0);

            showPage(ctx, items, newPage, true);
        },

        first: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Pagination expired',
                    ephemeral: true
                });
            }

            showPage(ctx, ctx.state.items, 0, true);
        },

        last: async (ctx: ComponentContext) => {
            if (!ctx.state) {
                return ctx.interaction.reply({
                    content: '⏱️ Pagination expired',
                    ephemeral: true
                });
            }

            const { items } = ctx.state;
            const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;

            showPage(ctx, items, maxPage, true);
        }
    }
};

function showPage(ctx: any, items: any[], page: number, isUpdate: boolean) {
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = items.slice(start, end);
    const maxPage = Math.ceil(items.length / ITEMS_PER_PAGE) - 1;

    const itemList = pageItems.map(item =>
        `**${item.id}.** ${item.name}\n*${item.description}*`
    ).join('\n\n');

    const container = new Container()
        .addText(`📄 **Paginated List**\n\n${itemList}\n\n*Page ${page + 1} of ${maxPage + 1} • Total Items: ${items.length}*`)
        .addActionRow({
            buttons: [
                {
                    customId: ctx.createId('first', { items, page }, 180),
                    label: '⏮️ First',
                    style: 'secondary',
                    disabled: page === 0
                },
                {
                    customId: ctx.createId('prev', { items, page }, 180),
                    label: '◀️ Previous',
                    style: 'secondary',
                    disabled: page === 0
                },
                {
                    customId: ctx.createId('next', { items, page }, 180),
                    label: 'Next ▶️',
                    style: 'secondary',
                    disabled: page === maxPage
                },
                {
                    customId: ctx.createId('last', { items, page }, 180),
                    label: 'Last ⏭️',
                    style: 'secondary',
                    disabled: page === maxPage
                }
            ]
        });

    if (isUpdate) {
        ctx.interaction.update({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    } else {
        ctx.reply({
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        });
    }
}

export default command;
