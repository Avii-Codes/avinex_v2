/**
 * Centralized Emoji Library
 * Organized by command categories for easy access.
 * Each category matches your bot's command structure.
 * 
 * Usage:
 * import { Core, Utility, Moderation, DEFAULT_CATEGORY_EMOJI } from './lib/emoji';
 * const message = `${Core.ping} Pong!`;
 */

/**
 * Default emoji for categories that don't have a specific icon yet.
 * Use this as a fallback when creating new command categories.
 */
export const DEFAULT_CATEGORY_EMOJI = '📁';

/**
 * Core Command Emojis
 * For essential bot commands
 */
export const General = {
    icon: '⚙️',
    ping: '🏓',
    pong: '🏓',
    help: '❓',
    info: 'ℹ️',
    about: '📋',
    invite: '✉️',
    support: '🆘',
    stats: '�',
    uptime: '⏰',
    status: '✅',
    version: '🔢',
} as const;

/**
 * Utility Command Emojis
 * For general utility commands
 */
export const Utility = {
    icon: '🔧',
    avatar: '🖼️',
    user: '👤',
    userInfo: '👤',
    server: '🏰',
    serverInfo: '🏰',
    search: '�',
    calculate: '�',
    poll: '�',
    reminder: '⏰',
    translate: '🌐',
    weather: '🌤️',
    quote: '�',
    say: '�',
    embed: '📝',
    color: '🎨',
    qrcode: '�',
} as const;

/**
 * Moderation Command Emojis
 * For moderation and management commands
 */
export const Moderation = {
    icon: '🛡️',
    ban: '🔨',
    unban: '✅',
    kick: '�',
    mute: '🔇',
    unmute: '🔊',
    warn: '⚠️',
    warnings: '📋',
    timeout: '⏱️',
    clear: '🧹',
    purge: '🗑️',
    slowmode: '�',
    lock: '�',
    unlock: '�',
    role: '�',
    nickname: '✏️',
    announce: '📢',
} as const;

/**
 * Music Command Emojis
 * For music player commands
 */
export const Music = {
    icon: '🎵',
    play: '▶️',
    pause: '⏸️',
    stop: '⏹️',
    skip: '⏭️',
    previous: '⏮️',
    shuffle: '🔀',
    repeat: '🔁',
    loop: '🔂',
    queue: '📜',
    nowPlaying: '🎶',
    volume: '🔊',
    volumeUp: '🔊',
    volumeDown: '�',
    lyrics: '📝',
    search: '🔍',
    playlist: '📑',
} as const;

/**
 * Economy Command Emojis
 * For economy and currency commands
 */
export const Economy = {
    icon: '💰',
    balance: '�',
    wallet: '👛',
    bank: '🏦',
    daily: '�',
    weekly: '�',
    work: '�',
    beg: '🙏',
    rob: '🔫',
    deposit: '➡️',
    withdraw: '⬅️',
    transfer: '💸',
    pay: '💳',
    shop: '🛒',
    buy: '🛍️',
    sell: '💲',
    inventory: '🎒',
    leaderboard: '�',
    coin: '🪙',
    money: '�',
} as const;

/**
 * Leveling/XP Command Emojis
 * For level and experience commands
 */
export const Leveling = {
    icon: '�',
    level: '⬆️',
    rank: '🏅',
    leaderboard: '🏆',
    xp: '✨',
    experience: '⭐',
    progress: '�',
    rewards: '🎁',
    milestone: '🎯',
    boost: '⚡',
    multiplier: '✖️',
} as const;

/**
 * Fun Command Emojis
 * For entertainment and fun commands
 */
export const Fun = {
    icon: '🎉',
    meme: '😂',
    joke: '🤣',
    Eightball: '🎱',
    dice: '🎲',
    coinflip: '🪙',
    rps: '✊',
    trivia: '❓',
    game: '�',
    pet: '�',
    feed: '🍖',
    hug: '🤗',
    kiss: '�',
    slap: '�',
    pat: '👏',
    rate: '⭐',
    ship: '💕',
    avatar: '�️',
} as const;

/**
 * Image Command Emojis
 * For image manipulation commands
 */
export const Image = {
    icon: '�️',
    meme: '�',
    avatar: '�️',
    blur: '🌫️',
    invert: '�',
    greyscale: '⚫',
    sepia: '�',
    pixelate: '�',
    deepfry: '🍳',
    triggered: '😡',
    wasted: '�',
    jail: '�',
    rainbow: '🌈',
} as const;

/**
 * Ticket Command Emojis
 * For support ticket system commands
 */
export const Tickets = {
    icon: '🎫',
    ticket: '🎫',
    create: '➕',
    close: '�',
    delete: '�️',
    claim: '✋',
    unclaim: '🤚',
    add: '👤',
    remove: '�',
    transcript: '�',
    panel: '🎛️',
    category: '�',
} as const;

/**
 * Automation Command Emojis
 * For automation and auto-mod commands
 */
export const Automation = {
    icon: '🤖',
    automod: '�️',
    autorole: '🎭',
    welcome: '👋',
    goodbye: '�',
    boost: '💎',
    reaction: '😀',
    trigger: '⚡',
    filter: '�',
    spam: '�',
    invite: '�',
    caps: '�',
    links: '🌐',
    mention: '�',
} as const;

/**
 * Logging Command Emojis
 * For logging and audit commands
 */
export const Logging = {
    icon: '📝',
    log: '📝',
    audit: '🔍',
    modlog: '�',
    message: '💬',
    messageDelete: '🗑️',
    messageEdit: '✏️',
    member: '👤',
    memberJoin: '➡️',
    memberLeave: '⬅️',
    role: '🎭',
    roleCreate: '➕',
    roleDelete: '➖',
    channel: '�',
    channelCreate: '➕',
    channelDelete: '➖',
    voice: '�',
    voiceJoin: '�',
    voiceLeave: '�',
} as const;

/**
 * Configuration Command Emojis
 * For bot configuration commands
 */
export const Config = {
    icon: '⚙️',
    settings: '⚙️',
    setup: '🛠️',
    config: '�',
    prefix: '❗',
    language: '🌐',
    timezone: '�',
    enable: '✅',
    disable: '❌',
    toggle: '�',
    reset: '�',
    import: '�',
    export: '�',
    backup: '�',
    restore: '♻️',
} as const;

/**
 * AI Command Emojis
 * For AI and chatbot commands
 */
export const AI = {
    icon: '🤖',
    ai: '🤖',
    chat: '�',
    ask: '❓',
    imagine: '🎨',
    generate: '✨',
    summarize: '📝',
    translate: '�',
    code: '💻',
    assistant: '🤝',
    gpt: '🧠',
} as const;

/**
 * Developer Command Emojis
 * For developer/owner commands
 */
export const Developer = {
    icon: '👨‍💻',
    eval: '💻',
    exec: '⚡',
    reload: '�',
    shutdown: '�',
    restart: '🔄',
    maintenance: '�',
    debug: '�',
    logs: '�',
    database: '�',
    cache: '�️',
    guild: '🏰',
    user: '�',
    emit: '�',
    test: '🧪',
} as const;

/**
 * General Status & Feedback Emojis
 * For common status messages across all commands
 */
export const Status = {
    icon: '✅',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
    processing: '⚙️',
    pending: '�',
    completed: '✔️',
    failed: '✖️',
    cancelled: '🚫',
    online: '🟢',
    offline: '�',
    idle: '�',
    dnd: '⛔',
} as const;

/**
 * All emoji categories
 */
export const AllCategories = {
    General,
    Utility,
    Moderation,
    Music,
    Economy,
    Leveling,
    Fun,
    Image,
    Tickets,
    Automation,
    Logging,
    Config,
    AI,
    Developer,
    Status,
} as const;

/**
 * Get a random emoji from a specific category
 * @param category The category to get a random emoji from
 * @returns A random emoji from the category
 */
export function getRandomEmoji(category: keyof typeof AllCategories): string {
    const categoryEmojis = AllCategories[category];
    const emojiKeys = Object.keys(categoryEmojis).filter(key => key !== 'icon') as Array<keyof typeof categoryEmojis>;
    const randomKey = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
    return categoryEmojis[randomKey];
}

/**
 * Get all emojis from a category as an array
 * @param category The category to get emojis from
 * @returns Array of emojis (excluding the category icon)
 */
export function getCategoryEmojis(category: keyof typeof AllCategories): string[] {
    const categoryEmojis = AllCategories[category];
    return Object.entries(categoryEmojis)
        .filter(([key]) => key !== 'icon')
        .map(([_, emoji]) => emoji);
}

/**
 * Type for category names
 */
export type CategoryName = keyof typeof AllCategories;
