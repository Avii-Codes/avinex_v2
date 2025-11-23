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
    AttachmentBuilder
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
    };
}

export interface MediaItem {
    url: string;
    description?: string;
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
}

