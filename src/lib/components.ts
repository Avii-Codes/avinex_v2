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
export type ButtonStyleName = 'primary' | 'secondary' | 'success' | 'danger' | 'link';

export interface SectionOptions {
    texts: string[];
    accessory: {
        type: SectionAccessoryType;
        url?: string;
        label?: string;
        customId?: string;
        emoji?: string;
        style?: ButtonStyle | ButtonStyleName;
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
    style?: ButtonStyle | ButtonStyleName;
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

/**
 * Converts a button style name to ButtonStyle enum value.
 */
function getButtonStyle(style: ButtonStyle | ButtonStyleName | undefined): ButtonStyle | undefined {
    if (style === undefined) return undefined;
    if (typeof style === 'number') return style;

    const styleMap: Record<ButtonStyleName, ButtonStyle> = {
        primary: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        danger: ButtonStyle.Danger,
        link: ButtonStyle.Link
    };

    return styleMap[style];
}

export class Container extends ContainerBuilder {
    public files: AttachmentBuilder[] = [];
    private componentCount: number = 0;
    private static readonly MAX_COMPONENTS = 40;

    constructor() {
        super();
    }

    /**
     * Get a copy of the current components list.
     */
    public get items(): any[] {
        // @ts-ignore - Accessing protected property
        return [...(this.components || [])];
    }

    /**
     * Replace a component at a specific index.
     * @param index The index of the component to replace.
     * @param component The new component builder.
     * @returns The container instance for chaining.
     */
    public editComponent(index: number, component: any): this {
        // @ts-ignore
        if (!this.components || index < 0 || index >= this.components.length) {
            throw new Error(`Invalid component index: ${index}`);
        }
        // @ts-ignore
        this.components[index] = component;
        return this;
    }

    /**
     * Remove a component at a specific index.
     * @param index The index of the component to remove.
     * @returns The container instance for chaining.
     */
    public removeComponent(index: number): this {
        // @ts-ignore
        if (!this.components || index < 0 || index >= this.components.length) {
            throw new Error(`Invalid component index: ${index}`);
        }
        // @ts-ignore
        this.components.splice(index, 1);
        this.componentCount--;
        return this;
    }

    /**
     * Disable interactive components in the container.
     * @param options Specify which components to disable. If omitted, disables all.
     * @returns The container instance for chaining.
     */
    public disable(options?: { buttonAccessories?: boolean; buttons?: boolean; selectMenus?: boolean }): this {
        const disableAll = !options;
        const disableBtnAcc = disableAll || options?.buttonAccessories;
        const disableBtns = disableAll || options?.buttons;
        const disableMenus = disableAll || options?.selectMenus;

        // @ts-ignore
        for (const component of (this.components || [])) {
            // Handle Action Rows
            if (component instanceof ActionRowBuilder) {
                // @ts-ignore
                for (const item of component.components) {
                    if (item instanceof ButtonBuilder && disableBtns) {
                        item.setDisabled(true);
                    } else if (
                        (item instanceof StringSelectMenuBuilder ||
                            item instanceof UserSelectMenuBuilder ||
                            item instanceof RoleSelectMenuBuilder ||
                            item instanceof MentionableSelectMenuBuilder ||
                            item instanceof ChannelSelectMenuBuilder) && disableMenus
                    ) {
                        item.setDisabled(true);
                    }
                }
            }
            // Handle Sections (Button Accessories)
            else if (component instanceof SectionBuilder && disableBtnAcc) {
                // Try to access the accessory builder
                // @ts-ignore
                const accessory = component.accessory;
                if (accessory instanceof ButtonBuilder) {
                    accessory.setDisabled(true);
                }
            }
        }
        return this;
    }

    /**
     * Update the content of a TextDisplay component.
     * @param index The index of the text component.
     * @param content The new content string.
     * @returns The container instance for chaining.
     */
    public updateText(index: number, content: string): this {
        // @ts-ignore
        const component = this.components?.[index];
        if (!(component instanceof TextDisplayBuilder)) {
            throw new Error(`Component at index ${index} is not a TextDisplayBuilder.`);
        }

        if (content.length > 4000) {
            throw new Error(`Text content exceeds maximum length! Maximum 4000 characters allowed.`);
        }

        component.setContent(content);
        return this;
    }

    /**
     * Update a button within an ActionRow.
     * @param rowIndex The index of the ActionRow component.
     * @param buttonIndex The index of the button within the row.
     * @param options The properties to update.
     * @returns The container instance for chaining.
     */
    public updateButton(rowIndex: number, buttonIndex: number, options: Partial<ButtonOptions>): this {
        // @ts-ignore
        const row = this.components?.[rowIndex];
        if (!(row instanceof ActionRowBuilder)) {
            throw new Error(`Component at index ${rowIndex} is not an ActionRowBuilder.`);
        }

        // @ts-ignore - Accessing components of the row
        const button = row.components?.[buttonIndex];
        if (!button || !(button instanceof ButtonBuilder)) {
            throw new Error(`Button at index ${buttonIndex} not found in row ${rowIndex}.`);
        }

        if (options.label !== undefined) button.setLabel(options.label);
        if (options.emoji !== undefined) button.setEmoji(options.emoji);
        if (options.disabled !== undefined) button.setDisabled(options.disabled);

        if (options.url) {
            button.setURL(options.url);
            button.setStyle(ButtonStyle.Link);
        } else {
            if (options.customId) button.setCustomId(options.customId);
            if (options.style) {
                const style = getButtonStyle(options.style);
                if (style) button.setStyle(style);
            }
        }

        return this;
    }

    /**
     * Validates that adding a component won't exceed the 50-component limit.
     * @throws Error if limit would be exceeded
     */
    private validateComponentLimit(): void {
        if (this.componentCount >= Container.MAX_COMPONENTS) {
            throw new Error(
                `Container component limit exceeded! Maximum ${Container.MAX_COMPONENTS} components allowed. ` +
                `Current count: ${this.componentCount}. ` +
                `Note: Each add* method (addText, addSeparator, addSection, addMedia, addActionRow) counts as 1 component.`
            );
        }
    }

    /**
     * Sets the accent color for the container.
     * @param color The color as a hex string ("#8b5a2b" or "8b5a2b") or hex number (0x8b5a2b).
     * @returns The container instance for chaining.
     */
    public setColor(color: string | number): this {
        const hexColor = typeof color === 'string'
            ? parseInt(color.replace('#', ''), 16)
            : color;
        super.setAccentColor(hexColor);
        return this;
    }

    /**
     * Adds a header (text + separator). This is a convenience method.
     * Counts as 2 components.
     * @param content Header text content.
     * @param options Optional separator options.
     * @returns The container instance for chaining.
     */
    public addHeader(content: string, options?: { spacing?: SeparatorSize; divider?: boolean }): this {
        this.validateComponentLimit();
        this.validateComponentLimit(); // Validate twice since we're adding 2 components

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        this.componentCount++;

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
        this.componentCount++;

        return this;
    }

    /**
     * Adds a footer (separator + text). This is a convenience method.
     * Counts as 2 components.
     * @param content Footer text content.
     * @param options Optional separator options.
     * @returns The container instance for chaining.
     */
    public addFooter(content: string, options?: { spacing?: SeparatorSize; divider?: boolean }): this {
        this.validateComponentLimit();
        this.validateComponentLimit(); // Validate twice since we're adding 2 components

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
        this.componentCount++;

        this.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        this.componentCount++;

        return this;
    }

    /**
     * Adds a divider (separator with divider enabled). This is a convenience method.
     * Counts as 1 component.
     * @param spacing Optional spacing size.
     * @returns The container instance for chaining.
     */
    public addDivider(spacing?: SeparatorSize): this {
        return this.addSeparator({ spacing, divider: true });
    }

    /**
     * Adds a text display component to the container.
     * @param content The content string or a pre-built TextDisplayBuilder.
     * @returns The container instance for chaining.
     */
    public addText(content: string | TextDisplayBuilder): this {
        this.validateComponentLimit();

        // Validate character limit for string content
        if (typeof content === 'string' && content.length > 4000) {
            throw new Error(
                `Text content exceeds maximum length! Maximum 4000 characters allowed. ` +
                `Current length: ${content.length} characters.`
            );
        }

        if (content instanceof TextDisplayBuilder) {
            this.addTextDisplayComponents(content);
        } else {
            this.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
        }
        this.componentCount++;
        return this;
    }

    /**
     * Adds a separator component to the container.
     * @param options Options for the separator or a pre-built SeparatorBuilder.
     * @returns The container instance for chaining.
     */
    public addSeparator(options?: { spacing?: SeparatorSize; divider?: boolean } | SeparatorBuilder): this {
        this.validateComponentLimit();
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
        this.componentCount++;
        return this;
    }

    /**
     * Adds a section component to the container.
     * @param options Options for the section or a pre-built SectionBuilder.
     * @returns The container instance for chaining.
     */
    public addSection(options: SectionOptions | SectionBuilder): this {
        this.validateComponentLimit();
        if (options instanceof SectionBuilder) {
            this.addSectionComponents(options);
        } else {
            // Validate texts array is not empty
            if (!options.texts || options.texts.length === 0) {
                throw new Error('Section must have at least one text element in the texts array.');
            }

            // Validate max 3 texts per section
            if (options.texts.length > 3) {
                throw new Error(
                    `Section can have a maximum of 3 text elements. ` +
                    `Current count: ${options.texts.length}. ` +
                    `Consider splitting into multiple sections or using addText() instead.`
                );
            }

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
                    button.setStyle(getButtonStyle(options.accessory.style) || ButtonStyle.Secondary);
                }

                section.setButtonAccessory(button);
            }

            this.addSectionComponents(section);
        }
        this.componentCount++;
        return this;
    }

    /**
     * Adds a media gallery component to the container.
     * @param items List of media items (max 10) or a pre-built MediaGalleryBuilder.
     * @returns The container instance for chaining.
     */
    public addMedia(items: MediaItem[] | MediaGalleryBuilder): this {
        this.validateComponentLimit();
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
        this.componentCount++;
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
        this.validateComponentLimit();
        if (options instanceof ActionRowBuilder) {
            this.addActionRowComponents(options as any);
            this.componentCount++;
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
                        button.setStyle(getButtonStyle(btnOpts.style) || ButtonStyle.Secondary);
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

            this.componentCount++;
        }
        return this;
    }
    /**
     * Creates a shallow copy of the container.
     * @returns A new Container instance with the same components and files.
     */
    public clone(): Container {
        const clone = new Container();

        // Copy properties
        clone.files = [...this.files];
        clone['componentCount'] = this.componentCount;

        // Copy components from parent ContainerBuilder
        // @ts-ignore - Accessing protected/private property
        if (this.components) {
            // @ts-ignore
            clone.components = [...this.components];
        }

        return clone;
    }
}

