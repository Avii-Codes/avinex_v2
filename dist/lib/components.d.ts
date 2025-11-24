import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, ButtonStyle, MediaGalleryBuilder, AttachmentBuilder, ActionRowBuilder } from 'discord.js';
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
interface BaseSelectMenuOptions {
    customId: string;
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}
export interface StringSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'string';
    options: Array<{
        label: string;
        value: string;
        description?: string;
        emoji?: string;
    }>;
}
export interface UserSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'user';
    options?: never;
}
export interface RoleSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'role';
    options?: never;
}
export interface MentionableSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'mentionable';
    options?: never;
}
export interface ChannelSelectMenuOptions extends BaseSelectMenuOptions {
    type: 'channel';
    options?: never;
}
export type SelectMenuOptions = StringSelectMenuOptions | UserSelectMenuOptions | RoleSelectMenuOptions | MentionableSelectMenuOptions | ChannelSelectMenuOptions;
export interface ActionRowOptions {
    buttons?: ButtonOptions[];
    menu?: SelectMenuOptions;
}
export declare class Container extends ContainerBuilder {
    files: AttachmentBuilder[];
    private componentCount;
    private static readonly MAX_COMPONENTS;
    constructor();
    /**
     * Validates that adding a component won't exceed the 50-component limit.
     * @throws Error if limit would be exceeded
     */
    private validateComponentLimit;
    /**
     * Sets the accent color for the container.
     * @param color The color as a hex string ("#8b5a2b" or "8b5a2b") or hex number (0x8b5a2b).
     * @returns The container instance for chaining.
     */
    setColor(color: string | number): this;
    /**
     * Adds a header (text + separator). This is a convenience method.
     * Counts as 2 components.
     * @param content Header text content.
     * @param options Optional separator options.
     * @returns The container instance for chaining.
     */
    addHeader(content: string, options?: {
        spacing?: SeparatorSize;
        divider?: boolean;
    }): this;
    /**
     * Adds a footer (separator + text). This is a convenience method.
     * Counts as 2 components.
     * @param content Footer text content.
     * @param options Optional separator options.
     * @returns The container instance for chaining.
     */
    addFooter(content: string, options?: {
        spacing?: SeparatorSize;
        divider?: boolean;
    }): this;
    /**
     * Adds a divider (separator with divider enabled). This is a convenience method.
     * Counts as 1 component.
     * @param spacing Optional spacing size.
     * @returns The container instance for chaining.
     */
    addDivider(spacing?: SeparatorSize): this;
    /**
     * Adds a text display component to the container.
     * @param content The content string or a pre-built TextDisplayBuilder.
     * @returns The container instance for chaining.
     */
    addText(content: string | TextDisplayBuilder): this;
    /**
     * Adds a separator component to the container.
     * @param options Options for the separator or a pre-built SeparatorBuilder.
     * @returns The container instance for chaining.
     */
    addSeparator(options?: {
        spacing?: SeparatorSize;
        divider?: boolean;
    } | SeparatorBuilder): this;
    /**
     * Adds a section component to the container.
     * @param options Options for the section or a pre-built SectionBuilder.
     * @returns The container instance for chaining.
     */
    addSection(options: SectionOptions | SectionBuilder): this;
    /**
     * Adds a media gallery component to the container.
     * @param items List of media items (max 10) or a pre-built MediaGalleryBuilder.
     * @returns The container instance for chaining.
     */
    addMedia(items: MediaItem[] | MediaGalleryBuilder): this;
    /**
     * Adds an attachment to the container's file list.
     * @param attachment The attachment source (path, buffer, or AttachmentBuilder).
     * @param name Optional filename if passing a path/buffer.
     * @returns The container instance for chaining.
     */
    addAttachment(attachment: string | Buffer | AttachmentBuilder, name?: string): this;
    /**
     * Adds an action row component to the container.
     * @param options Options for the action row or a pre-built ActionRowBuilder.
     * @returns The container instance for chaining.
     */
    addActionRow(options: ActionRowOptions | ActionRowBuilder): this;
}
export {};
//# sourceMappingURL=components.d.ts.map