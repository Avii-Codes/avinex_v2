"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const discord_js_1 = require("discord.js");
/**
 * Converts a button style name to ButtonStyle enum value.
 */
function getButtonStyle(style) {
    if (style === undefined)
        return undefined;
    if (typeof style === 'number')
        return style;
    const styleMap = {
        primary: discord_js_1.ButtonStyle.Primary,
        secondary: discord_js_1.ButtonStyle.Secondary,
        success: discord_js_1.ButtonStyle.Success,
        danger: discord_js_1.ButtonStyle.Danger,
        link: discord_js_1.ButtonStyle.Link
    };
    return styleMap[style];
}
class Container extends discord_js_1.ContainerBuilder {
    constructor() {
        super();
        this.files = [];
        this.componentCount = 0;
    }
    /**
     * Validates that adding a component won't exceed the 50-component limit.
     * @throws Error if limit would be exceeded
     */
    validateComponentLimit() {
        if (this.componentCount >= Container.MAX_COMPONENTS) {
            throw new Error(`Container component limit exceeded! Maximum ${Container.MAX_COMPONENTS} components allowed. ` +
                `Current count: ${this.componentCount}. ` +
                `Note: Each add* method (addText, addSeparator, addSection, addMedia, addActionRow) counts as 1 component.`);
        }
    }
    /**
     * Sets the accent color for the container.
     * @param color The color as a hex string ("#8b5a2b" or "8b5a2b") or hex number (0x8b5a2b).
     * @returns The container instance for chaining.
     */
    setColor(color) {
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
    addHeader(content, options) {
        this.validateComponentLimit();
        this.validateComponentLimit(); // Validate twice since we're adding 2 components
        this.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(content));
        this.componentCount++;
        const separator = new discord_js_1.SeparatorBuilder();
        if (options?.spacing) {
            const spacingMap = {
                small: discord_js_1.SeparatorSpacingSize.Small,
                large: discord_js_1.SeparatorSpacingSize.Large
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
    addFooter(content, options) {
        this.validateComponentLimit();
        this.validateComponentLimit(); // Validate twice since we're adding 2 components
        const separator = new discord_js_1.SeparatorBuilder();
        if (options?.spacing) {
            const spacingMap = {
                small: discord_js_1.SeparatorSpacingSize.Small,
                large: discord_js_1.SeparatorSpacingSize.Large
            };
            separator.setSpacing(spacingMap[options.spacing]);
        }
        if (options?.divider !== undefined) {
            separator.setDivider(options.divider);
        }
        this.addSeparatorComponents(separator);
        this.componentCount++;
        this.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(content));
        this.componentCount++;
        return this;
    }
    /**
     * Adds a divider (separator with divider enabled). This is a convenience method.
     * Counts as 1 component.
     * @param spacing Optional spacing size.
     * @returns The container instance for chaining.
     */
    addDivider(spacing) {
        return this.addSeparator({ spacing, divider: true });
    }
    /**
     * Adds a text display component to the container.
     * @param content The content string or a pre-built TextDisplayBuilder.
     * @returns The container instance for chaining.
     */
    addText(content) {
        this.validateComponentLimit();
        // Validate character limit for string content
        if (typeof content === 'string' && content.length > 4000) {
            throw new Error(`Text content exceeds maximum length! Maximum 4000 characters allowed. ` +
                `Current length: ${content.length} characters.`);
        }
        if (content instanceof discord_js_1.TextDisplayBuilder) {
            this.addTextDisplayComponents(content);
        }
        else {
            this.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(content));
        }
        this.componentCount++;
        return this;
    }
    /**
     * Adds a separator component to the container.
     * @param options Options for the separator or a pre-built SeparatorBuilder.
     * @returns The container instance for chaining.
     */
    addSeparator(options) {
        this.validateComponentLimit();
        if (options instanceof discord_js_1.SeparatorBuilder) {
            this.addSeparatorComponents(options);
        }
        else {
            const separator = new discord_js_1.SeparatorBuilder();
            if (options?.spacing) {
                const spacingMap = {
                    small: discord_js_1.SeparatorSpacingSize.Small,
                    large: discord_js_1.SeparatorSpacingSize.Large
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
    addSection(options) {
        this.validateComponentLimit();
        if (options instanceof discord_js_1.SectionBuilder) {
            this.addSectionComponents(options);
        }
        else {
            // Validate texts array is not empty
            if (!options.texts || options.texts.length === 0) {
                throw new Error('Section must have at least one text element in the texts array.');
            }
            // Validate max 3 texts per section
            if (options.texts.length > 3) {
                throw new Error(`Section can have a maximum of 3 text elements. ` +
                    `Current count: ${options.texts.length}. ` +
                    `Consider splitting into multiple sections or using addText() instead.`);
            }
            const section = new discord_js_1.SectionBuilder();
            // Add text components
            for (const text of options.texts) {
                section.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent(text));
            }
            // Handle Accessory
            if (options.accessory.type === 'thumbnail') {
                if (!options.accessory.url)
                    throw new Error('URL is required for thumbnail accessory');
                const thumbnail = new discord_js_1.ThumbnailBuilder({ media: { url: options.accessory.url } });
                section.setThumbnailAccessory(thumbnail);
            }
            else if (options.accessory.type === 'button') {
                const button = new discord_js_1.ButtonBuilder();
                if (options.accessory.label)
                    button.setLabel(options.accessory.label);
                if (options.accessory.emoji)
                    button.setEmoji(options.accessory.emoji);
                if (options.accessory.disabled !== undefined)
                    button.setDisabled(options.accessory.disabled);
                if (options.accessory.url) {
                    button.setURL(options.accessory.url);
                    button.setStyle(discord_js_1.ButtonStyle.Link);
                }
                else {
                    if (!options.accessory.customId)
                        throw new Error('CustomID is required for non-link buttons');
                    button.setCustomId(options.accessory.customId);
                    button.setStyle(getButtonStyle(options.accessory.style) || discord_js_1.ButtonStyle.Secondary);
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
    addMedia(items) {
        this.validateComponentLimit();
        if (items instanceof discord_js_1.MediaGalleryBuilder) {
            this.addMediaGalleryComponents(items);
        }
        else {
            if (items.length > 10)
                throw new Error('Media gallery cannot have more than 10 items.');
            const gallery = new discord_js_1.MediaGalleryBuilder();
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
    addAttachment(attachment, name) {
        if (attachment instanceof discord_js_1.AttachmentBuilder) {
            this.files.push(attachment);
        }
        else {
            this.files.push(new discord_js_1.AttachmentBuilder(attachment, { name }));
        }
        return this;
    }
    /**
     * Adds an action row component to the container.
     * @param options Options for the action row or a pre-built ActionRowBuilder.
     * @returns The container instance for chaining.
     */
    addActionRow(options) {
        this.validateComponentLimit();
        if (options instanceof discord_js_1.ActionRowBuilder) {
            this.addActionRowComponents(options);
            this.componentCount++;
        }
        else {
            // Validate: must have either buttons or menu, not both
            if (options.buttons && options.menu) {
                throw new Error('ActionRow cannot have both buttons and menu.');
            }
            if (!options.buttons && !options.menu) {
                throw new Error('ActionRow must have either buttons or menu.');
            }
            if (options.buttons) {
                const row = new discord_js_1.ActionRowBuilder();
                if (options.buttons.length > 5)
                    throw new Error('ActionRow cannot have more than 5 buttons.');
                for (const btnOpts of options.buttons) {
                    const button = new discord_js_1.ButtonBuilder();
                    if (btnOpts.label)
                        button.setLabel(btnOpts.label);
                    if (btnOpts.emoji)
                        button.setEmoji(btnOpts.emoji);
                    if (btnOpts.disabled !== undefined)
                        button.setDisabled(btnOpts.disabled);
                    if (btnOpts.url) {
                        button.setURL(btnOpts.url);
                        button.setStyle(discord_js_1.ButtonStyle.Link);
                    }
                    else {
                        if (!btnOpts.customId)
                            throw new Error('CustomID is required for non-link buttons');
                        button.setCustomId(btnOpts.customId);
                        button.setStyle(getButtonStyle(btnOpts.style) || discord_js_1.ButtonStyle.Secondary);
                    }
                    row.addComponents(button);
                }
                this.addActionRowComponents(row);
            }
            else if (options.menu) {
                const { type, customId, placeholder, options: menuOptions, minValues, maxValues } = options.menu;
                switch (type) {
                    case 'string': {
                        if (!menuOptions || menuOptions.length === 0) {
                            throw new Error('String select menu requires at least one option.');
                        }
                        const menu = new discord_js_1.StringSelectMenuBuilder()
                            .setCustomId(customId)
                            .addOptions(menuOptions);
                        if (placeholder)
                            menu.setPlaceholder(placeholder);
                        if (minValues !== undefined)
                            menu.setMinValues(minValues);
                        if (maxValues !== undefined)
                            menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined)
                            menu.setDisabled(options.menu.disabled);
                        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'user': {
                        const menu = new discord_js_1.UserSelectMenuBuilder().setCustomId(customId);
                        if (placeholder)
                            menu.setPlaceholder(placeholder);
                        if (minValues !== undefined)
                            menu.setMinValues(minValues);
                        if (maxValues !== undefined)
                            menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined)
                            menu.setDisabled(options.menu.disabled);
                        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'role': {
                        const menu = new discord_js_1.RoleSelectMenuBuilder().setCustomId(customId);
                        if (placeholder)
                            menu.setPlaceholder(placeholder);
                        if (minValues !== undefined)
                            menu.setMinValues(minValues);
                        if (maxValues !== undefined)
                            menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined)
                            menu.setDisabled(options.menu.disabled);
                        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'mentionable': {
                        const menu = new discord_js_1.MentionableSelectMenuBuilder().setCustomId(customId);
                        if (placeholder)
                            menu.setPlaceholder(placeholder);
                        if (minValues !== undefined)
                            menu.setMinValues(minValues);
                        if (maxValues !== undefined)
                            menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined)
                            menu.setDisabled(options.menu.disabled);
                        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                    case 'channel': {
                        const menu = new discord_js_1.ChannelSelectMenuBuilder().setCustomId(customId);
                        if (placeholder)
                            menu.setPlaceholder(placeholder);
                        if (minValues !== undefined)
                            menu.setMinValues(minValues);
                        if (maxValues !== undefined)
                            menu.setMaxValues(maxValues);
                        if (options.menu.disabled !== undefined)
                            menu.setDisabled(options.menu.disabled);
                        const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
                        this.addActionRowComponents(row);
                        break;
                    }
                }
            }
            this.componentCount++;
        }
        return this;
    }
}
exports.Container = Container;
Container.MAX_COMPONENTS = 40;
//# sourceMappingURL=components.js.map