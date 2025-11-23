import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ThumbnailBuilder
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

export class Container extends ContainerBuilder {
    constructor() {
        super();
    }

    /**
     * Adds a text display component to the container.
     * @param content The content of the text display.
     * @returns The container instance for chaining.
     */
    public addText(content: string): this {
        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        return this;
    }

    /**
     * Adds a separator component to the container.
     * @param options Options for the separator.
     * @returns The container instance for chaining.
     */
    public addSeparator(options?: { spacing?: SeparatorSize; divider?: boolean }): this {
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
        return this;
    }

    /**
     * Adds a section component to the container.
     * @param options Options for the section.
     * @returns The container instance for chaining.
     */
    public addSection(options: SectionOptions): this {
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
        return this;
    }
}
