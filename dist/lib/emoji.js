"use strict";
/**
 * Centralized Emoji Library
 * Organized by command categories for easy access.
 * Each category matches your bot's command structure.
 *
 * Usage:
 * import { Core, Utility, Moderation, DEFAULT_CATEGORY_EMOJI } from './lib/emoji';
 * const message = `${Core.ping} Pong!`;
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllCategories = exports.Status = exports.Developer = exports.AI = exports.Config = exports.Logging = exports.Automation = exports.Tickets = exports.Image = exports.Fun = exports.Leveling = exports.Economy = exports.Music = exports.Moderation = exports.Utility = exports.General = exports.DEFAULT_CATEGORY_EMOJI = void 0;
exports.getRandomEmoji = getRandomEmoji;
exports.getCategoryEmojis = getCategoryEmojis;
/**
 * Default emoji for categories that don't have a specific icon yet.
 * Use this as a fallback when creating new command categories.
 */
exports.DEFAULT_CATEGORY_EMOJI = '📁';
/**
 * Core Command Emojis
 * For essential bot commands
 */
exports.General = {
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
};
/**
 * Utility Command Emojis
 * For general utility commands
 */
exports.Utility = {
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
};
/**
 * Moderation Command Emojis
 * For moderation and management commands
 */
exports.Moderation = {
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
};
/**
 * Music Command Emojis
 * For music player commands
 */
exports.Music = {
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
};
/**
 * Economy Command Emojis
 * For economy and currency commands
 */
exports.Economy = {
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
};
/**
 * Leveling/XP Command Emojis
 * For level and experience commands
 */
exports.Leveling = {
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
};
/**
 * Fun Command Emojis
 * For entertainment and fun commands
 */
exports.Fun = {
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
};
/**
 * Image Command Emojis
 * For image manipulation commands
 */
exports.Image = {
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
};
/**
 * Ticket Command Emojis
 * For support ticket system commands
 */
exports.Tickets = {
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
};
/**
 * Automation Command Emojis
 * For automation and auto-mod commands
 */
exports.Automation = {
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
};
/**
 * Logging Command Emojis
 * For logging and audit commands
 */
exports.Logging = {
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
};
/**
 * Configuration Command Emojis
 * For bot configuration commands
 */
exports.Config = {
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
};
/**
 * AI Command Emojis
 * For AI and chatbot commands
 */
exports.AI = {
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
};
/**
 * Developer Command Emojis
 * For developer/owner commands
 */
exports.Developer = {
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
};
/**
 * General Status & Feedback Emojis
 * For common status messages across all commands
 */
exports.Status = {
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
};
/**
 * All emoji categories
 */
exports.AllCategories = {
    General: exports.General,
    Utility: exports.Utility,
    Moderation: exports.Moderation,
    Music: exports.Music,
    Economy: exports.Economy,
    Leveling: exports.Leveling,
    Fun: exports.Fun,
    Image: exports.Image,
    Tickets: exports.Tickets,
    Automation: exports.Automation,
    Logging: exports.Logging,
    Config: exports.Config,
    AI: exports.AI,
    Developer: exports.Developer,
    Status: exports.Status,
};
/**
 * Get a random emoji from a specific category
 * @param category The category to get a random emoji from
 * @returns A random emoji from the category
 */
function getRandomEmoji(category) {
    const categoryEmojis = exports.AllCategories[category];
    const emojiKeys = Object.keys(categoryEmojis).filter(key => key !== 'icon');
    const randomKey = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
    return categoryEmojis[randomKey];
}
/**
 * Get all emojis from a category as an array
 * @param category The category to get emojis from
 * @returns Array of emojis (excluding the category icon)
 */
function getCategoryEmojis(category) {
    const categoryEmojis = exports.AllCategories[category];
    return Object.entries(categoryEmojis)
        .filter(([key]) => key !== 'icon')
        .map(([_, emoji]) => emoji);
}
//# sourceMappingURL=emoji.js.map