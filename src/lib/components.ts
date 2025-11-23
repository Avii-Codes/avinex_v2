import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    AttachmentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    ChannelSelectMenuBuilder
} from 'discord.js';

export type SeparatorSize = 'small' | 'large';
export type SectionAccessoryType = 'button' | 'thumbnail';

export interface SectionOptions {
    texts: string[];
    accessory: {
        type: SectionAccessoryType;
        url?: string;
        label?: string;
        customId?: string;
        emoji?: string;
        style?: ButtonStyle;
        disabled?: boolean;
    };
}

export interface MediaItem {
    url: string;
    description?: string;
}

export interface ButtonOptions {
    label?: string;
    customId?: string;
    url?: string;
    emoji?: string;
    style?: ButtonStyle;
    disabled?: boolean;
}

export type SelectMenuType = 'string' | 'user' | 'role' | 'mentionable' | 'channel';

// Base options shared by all select menus
interface BaseSelectMenuOptions {
    customId: string;
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}

// String select menu - requires options (max 25)
export interface StringSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'string';
    options: Array<{ label: string; value: string; description?: string; emoji?: string }>;
}

// User select menu - Discord auto-generates, no options allowed
export interface UserSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'user';
    options?: never;
}

// Role select menu - Discord auto-generates, no options allowed
export interface RoleSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'role';
    options?: never;
}

// Mentionable select menu - Discord auto-generates, no options allowed
export interface MentionableSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'mentionable';
    options?: never;
}

// Channel select menu - Discord auto-generates, no options allowed
export interface ChannelSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'channel';
    options?: never;
}

// Union type for all select menus - provides compile-time type safety
export type SelectMenuOptions =
    | StringSelectMenuOptions
    | UserSelectMenuOptions
    | RoleSelectMenuOptions
    | MentionableSelectMenuOptions
    | ChannelSelectMenuOptions;

export interface ActionRowOptions {
    buttons?: ButtonOptions[];
    menu?: SelectMenuOptions;
}

export class Container extends ContainerBuilder {
    public files: AttachmentBuilder[] = [];

    constructor() {
        super();
    }

    /**
     * Adds a text display component to the container.
     * @param content The content string or a pre-built TextDisplayBuilder.
     * @returns The container instance for chaining.
     */
    public addText(content: string | TextDisplayBuilder): this {
        if (content instanceof TextDisplayBuilder) {
            this.addTextDisplayComponents(content);
        } else {
            this.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        }
        return this;
    }

    /**
     * Adds a separator component to the container.
     * @param options Options for the separator or a pre-built SeparatorBuilder.
     * @returns The container instance for chaining.
     */
    public addSeparator(options?: { spacing?: SeparatorSize; divider?: boolean } | SeparatorBuilder): this {
        if (options instanceof SeparatorBuilder) {
            this.addSeparatorComponents(options);
        } else {
            const separator = new SeparatorBuilder();

            if (options?.spacing) {
                const spacingMap: Record<SeparatorSize, SeparatorSpacingSize> = {
                    small: SeparatorSpacingSize.Small,
                    large: SeparatorSpacingSize.Large
                };
                separator.setSpacing(spacingMap[options.spacing]);
            }

            if (options?.divider !== undefined) {
                separator.setDivider(options.divider);
            }

            this.addSeparatorComponents(separator);
        }
        return this;
    }

    /**
     * Adds a section component to the container.
     * @param options Options for the section or a pre-built SectionBuilder.
     * @returns The container instance for chaining.
     */
    public addSection(options: SectionOptions | SectionBuilder): this {
        if (options instanceof SectionBuilder) {
            this.addSectionComponents(options);
        } else {
            const section = new SectionBuilder();

            // Add text components
            for (const text of options.texts) {
                section.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
            }

            // Handle Accessory
            if (options.accessory.type === 'thumbnail') {
                if (!options.accessory.url) throw new Error('URL is required for thumbnail accessory');
                const thumbnail = new ThumbnailBuilder({ media: { url: options.accessory.url } });
                section.setThumbnailAccessory(thumbnail);
            } else if (options.accessory.type === 'button') {
                const button = new ButtonBuilder();

                if (options.accessory.label) button.setLabel(options.accessory.label);
                if (options.accessory.emoji) button.setEmoji(options.accessory.emoji);
                if (options.accessory.disabled !== undefined) button.setDisabled(options.accessory.disabled);

                if (options.accessory.url) {
                    button.setURL(options.accessory.url);
                    button.setStyle(ButtonStyle.Link);
                } else {
                    if (!options.accessory.customId) throw new Error('CustomID is required for non-link buttons');
                    button.setCustomId(options.accessory.customId);
                    button.setStyle(options.accessory.style || ButtonStyle.Secondary);
                }

                section.setButtonAccessory(button);
            }

            this.addSectionComponents(section);
        }
        return this;
    }

    /**
     * Adds a media gallery component to the container.
     * @param items List of media items (max 10) or a pre-built MediaGalleryBuilder.
     * @returns The container instance for chaining.
     */
    public addMedia(items: MediaItem[] | MediaGalleryBuilder): this {
        if (items instanceof MediaGalleryBuilder) {
            this.addMediaGalleryComponents(items);
        } else {
            if (items.length > 10) throw new Error('Media gallery cannot have more than 10 items.');

            const gallery = new MediaGalleryBuilder();

            const galleryItems = items.map(item => ({
                media: { url: item.url },
                description: item.description
            }));

            gallery.addItems(galleryItems);
            this.addMediaGalleryComponents(gallery);
        }
        return this;
    }

    /**
     * Adds an attachment to the container's file list.
     * @param attachment The attachment source (path, buffer, or AttachmentBuilder).
     * @param name Optional filename if passing a path/buffer.
     * @returns The container instance for chaining.
     */
    public addAttachment(attachment: string | Buffer | AttachmentBuilder, name?: string): this {
        if (attachment instanceof AttachmentBuilder) {
            this.files.push(attachment);
        } else {
            this.files.push(new AttachmentBuilder(attachment, { name }));
        }
        return this;
    }

    /**
     * Adds an action row component to the container.
     * @param options Options for the action row or a pre-built ActionRowBuilder.
     * @returns The container instance for chaining.
     */
    public addActionRow(options: ActionRowOptions | ActionRowBuilder): this {
        if (options instanceof ActionRowBuilder) {
            this.addActionRowComponents(options as any);
        } else {
            // Validate: must have either buttons or menu, not both
            if (options.buttons && options.menu) {
                throw new Error('ActionRow cannot have both buttons and menu.');
            }
            if (!options.buttons && !options.menu) {
                throw new Error('ActionRow must have either buttons or menu.');
            }

            if (options.buttons) {
                const row = new ActionRowBuilder<ButtonBuilder>();
                if (options.buttons.length > 5) throw new Error('ActionRow cannot have more than 5 buttons.');

                for (const btnOpts of options.buttons) {
                    const button = new ButtonBuilder();

                    if (btnOpts.label) button.setLabel(btnOpts.label);
                    if (btnOpts.emoji) button.setEmoji(btnOpts.emoji);
                    if (btnOpts.disabled !== undefined) button.setDisabled(btnOpts.disabled);

                    if (btnOpts.url) {
                        button.setURL(btnOpts.url);
                        button.setStyle(ButtonStyle.Link);
                    } else {
                        if (!btnOpts.customId) throw new Error('CustomID is required for non-link buttons');
                        button.setCustomId(btnOpts.customId);
                        button.setStyle(btnOpts.style || ButtonStyle.Secondary);
                    }

                    row.addComponents(button);
                }

                this.addActionRowComponents(row);
            } else if (options.menu) {
                const { type, customId, placeholder, options: menuOptions, minValues, maxValues } = options.menu;

                switch (type) {
                    case 'string': {
                        if (!menuOptions || menuOptions.length === 0) {
                            throw new Error('String select menu requires at least one option.');
                        }
                        const menu = new StringSelectMenuBuilder()
                            .setCustomId(customId)
                            .addOptions(menuOptions);
                        if (placeholder) menu.setPlaceholder(placeholder);
                        if (minValues !== undefined) menu.setMinValues(minValues);
                        if (maxValues !== undefined) menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined) menu.setDisabled(options.menu.disabled);

                        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'user': {
                        const menu = new UserSelectMenuBuilder().setCustomId(customId);
                        if (placeholder) menu.setPlaceholder(placeholder);
                        if (minValues !== undefined) menu.setMinValues(minValues);
                        if (maxValues !== undefined) menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined) menu.setDisabled(options.menu.disabled);

                        const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'role': {
                        const menu = new RoleSelectMenuBuilder().setCustomId(customId);
                        if (placeholder) menu.setPlaceholder(placeholder);
                        if (minValues !== undefined) menu.setMinValues(minValues);
                        if (maxValues !== undefined) menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined) menu.setDisabled(options.menu.disabled);

                        const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'mentionable': {
                        const menu = new MentionableSelectMenuBuilder().setCustomId(customId);
                        if (placeholder) menu.setPlaceholder(placeholder);
                        if (minValues !== undefined) menu.setMinValues(minValues);
                        if (maxValues !== undefined) menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined) menu.setDisabled(options.menu.disabled);

                        const row = new ActionRowBuilder<MentionableSelectMenuBuilder>().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'channel': {
                        const menu = new ChannelSelectMenuBuilder().setCustomId(customId);
                        if (placeholder) menu.setPlaceholder(placeholder);
                        if (minValues !== undefined) menu.setMinValues(minValues);
                        if (maxValues !== undefined) menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined) menu.setDisabled(options.menu.disabled);

                        const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                }
            }
        }
        return this;
    }
}

