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
export declare const DEFAULT_CATEGORY_EMOJI = "\uD83D\uDCC1";
/**
 * Core Command Emojis
 * For essential bot commands
 */
export declare const General: {
    readonly icon: "⚙️";
    readonly ping: "🏓";
    readonly pong: "🏓";
    readonly help: "❓";
    readonly info: "ℹ️";
    readonly about: "📋";
    readonly invite: "✉️";
    readonly support: "🆘";
    readonly stats: "�";
    readonly uptime: "⏰";
    readonly status: "✅";
    readonly version: "🔢";
};
/**
 * Utility Command Emojis
 * For general utility commands
 */
export declare const Utility: {
    readonly icon: "🔧";
    readonly avatar: "🖼️";
    readonly user: "👤";
    readonly userInfo: "👤";
    readonly server: "🏰";
    readonly serverInfo: "🏰";
    readonly search: "�";
    readonly calculate: "�";
    readonly poll: "�";
    readonly reminder: "⏰";
    readonly translate: "🌐";
    readonly weather: "🌤️";
    readonly quote: "�";
    readonly say: "�";
    readonly embed: "📝";
    readonly color: "🎨";
    readonly qrcode: "�";
};
/**
 * Moderation Command Emojis
 * For moderation and management commands
 */
export declare const Moderation: {
    readonly icon: "🛡️";
    readonly ban: "🔨";
    readonly unban: "✅";
    readonly kick: "�";
    readonly mute: "🔇";
    readonly unmute: "🔊";
    readonly warn: "⚠️";
    readonly warnings: "📋";
    readonly timeout: "⏱️";
    readonly clear: "🧹";
    readonly purge: "🗑️";
    readonly slowmode: "�";
    readonly lock: "�";
    readonly unlock: "�";
    readonly role: "�";
    readonly nickname: "✏️";
    readonly announce: "📢";
};
/**
 * Music Command Emojis
 * For music player commands
 */
export declare const Music: {
    readonly icon: "🎵";
    readonly play: "▶️";
    readonly pause: "⏸️";
    readonly stop: "⏹️";
    readonly skip: "⏭️";
    readonly previous: "⏮️";
    readonly shuffle: "🔀";
    readonly repeat: "🔁";
    readonly loop: "🔂";
    readonly queue: "📜";
    readonly nowPlaying: "🎶";
    readonly volume: "🔊";
    readonly volumeUp: "🔊";
    readonly volumeDown: "�";
    readonly lyrics: "📝";
    readonly search: "🔍";
    readonly playlist: "📑";
};
/**
 * Economy Command Emojis
 * For economy and currency commands
 */
export declare const Economy: {
    readonly icon: "💰";
    readonly balance: "�";
    readonly wallet: "👛";
    readonly bank: "🏦";
    readonly daily: "�";
    readonly weekly: "�";
    readonly work: "�";
    readonly beg: "🙏";
    readonly rob: "🔫";
    readonly deposit: "➡️";
    readonly withdraw: "⬅️";
    readonly transfer: "💸";
    readonly pay: "💳";
    readonly shop: "🛒";
    readonly buy: "🛍️";
    readonly sell: "💲";
    readonly inventory: "🎒";
    readonly leaderboard: "�";
    readonly coin: "🪙";
    readonly money: "�";
};
/**
 * Leveling/XP Command Emojis
 * For level and experience commands
 */
export declare const Leveling: {
    readonly icon: "�";
    readonly level: "⬆️";
    readonly rank: "🏅";
    readonly leaderboard: "🏆";
    readonly xp: "✨";
    readonly experience: "⭐";
    readonly progress: "�";
    readonly rewards: "🎁";
    readonly milestone: "🎯";
    readonly boost: "⚡";
    readonly multiplier: "✖️";
};
/**
 * Fun Command Emojis
 * For entertainment and fun commands
 */
export declare const Fun: {
    readonly icon: "🎉";
    readonly meme: "😂";
    readonly joke: "🤣";
    readonly Eightball: "🎱";
    readonly dice: "🎲";
    readonly coinflip: "🪙";
    readonly rps: "✊";
    readonly trivia: "❓";
    readonly game: "�";
    readonly pet: "�";
    readonly feed: "🍖";
    readonly hug: "🤗";
    readonly kiss: "�";
    readonly slap: "�";
    readonly pat: "👏";
    readonly rate: "⭐";
    readonly ship: "💕";
    readonly avatar: "�️";
};
/**
 * Image Command Emojis
 * For image manipulation commands
 */
export declare const Image: {
    readonly icon: "�️";
    readonly meme: "�";
    readonly avatar: "�️";
    readonly blur: "🌫️";
    readonly invert: "�";
    readonly greyscale: "⚫";
    readonly sepia: "�";
    readonly pixelate: "�";
    readonly deepfry: "🍳";
    readonly triggered: "😡";
    readonly wasted: "�";
    readonly jail: "�";
    readonly rainbow: "🌈";
};
/**
 * Ticket Command Emojis
 * For support ticket system commands
 */
export declare const Tickets: {
    readonly icon: "🎫";
    readonly ticket: "🎫";
    readonly create: "➕";
    readonly close: "�";
    readonly delete: "�️";
    readonly claim: "✋";
    readonly unclaim: "🤚";
    readonly add: "👤";
    readonly remove: "�";
    readonly transcript: "�";
    readonly panel: "🎛️";
    readonly category: "�";
};
/**
 * Automation Command Emojis
 * For automation and auto-mod commands
 */
export declare const Automation: {
    readonly icon: "🤖";
    readonly automod: "�️";
    readonly autorole: "🎭";
    readonly welcome: "👋";
    readonly goodbye: "�";
    readonly boost: "💎";
    readonly reaction: "😀";
    readonly trigger: "⚡";
    readonly filter: "�";
    readonly spam: "�";
    readonly invite: "�";
    readonly caps: "�";
    readonly links: "🌐";
    readonly mention: "�";
};
/**
 * Logging Command Emojis
 * For logging and audit commands
 */
export declare const Logging: {
    readonly icon: "📝";
    readonly log: "📝";
    readonly audit: "🔍";
    readonly modlog: "�";
    readonly message: "💬";
    readonly messageDelete: "🗑️";
    readonly messageEdit: "✏️";
    readonly member: "👤";
    readonly memberJoin: "➡️";
    readonly memberLeave: "⬅️";
    readonly role: "🎭";
    readonly roleCreate: "➕";
    readonly roleDelete: "➖";
    readonly channel: "�";
    readonly channelCreate: "➕";
    readonly channelDelete: "➖";
    readonly voice: "�";
    readonly voiceJoin: "�";
    readonly voiceLeave: "�";
};
/**
 * Configuration Command Emojis
 * For bot configuration commands
 */
export declare const Config: {
    readonly icon: "⚙️";
    readonly settings: "⚙️";
    readonly setup: "🛠️";
    readonly config: "�";
    readonly prefix: "❗";
    readonly language: "🌐";
    readonly timezone: "�";
    readonly enable: "✅";
    readonly disable: "❌";
    readonly toggle: "�";
    readonly reset: "�";
    readonly import: "�";
    readonly export: "�";
    readonly backup: "�";
    readonly restore: "♻️";
};
/**
 * AI Command Emojis
 * For AI and chatbot commands
 */
export declare const AI: {
    readonly icon: "🤖";
    readonly ai: "🤖";
    readonly chat: "�";
    readonly ask: "❓";
    readonly imagine: "🎨";
    readonly generate: "✨";
    readonly summarize: "📝";
    readonly translate: "�";
    readonly code: "💻";
    readonly assistant: "🤝";
    readonly gpt: "🧠";
};
/**
 * Developer Command Emojis
 * For developer/owner commands
 */
export declare const Developer: {
    readonly icon: "👨‍💻";
    readonly eval: "💻";
    readonly exec: "⚡";
    readonly reload: "�";
    readonly shutdown: "�";
    readonly restart: "🔄";
    readonly maintenance: "�";
    readonly debug: "�";
    readonly logs: "�";
    readonly database: "�";
    readonly cache: "�️";
    readonly guild: "🏰";
    readonly user: "�";
    readonly emit: "�";
    readonly test: "🧪";
};
/**
 * General Status & Feedback Emojis
 * For common status messages across all commands
 */
export declare const Status: {
    readonly icon: "✅";
    readonly success: "✅";
    readonly error: "❌";
    readonly warning: "⚠️";
    readonly info: "ℹ️";
    readonly loading: "⏳";
    readonly processing: "⚙️";
    readonly pending: "�";
    readonly completed: "✔️";
    readonly failed: "✖️";
    readonly cancelled: "🚫";
    readonly online: "🟢";
    readonly offline: "�";
    readonly idle: "�";
    readonly dnd: "⛔";
};
/**
 * All emoji categories
 */
export declare const AllCategories: {
    readonly General: {
        readonly icon: "⚙️";
        readonly ping: "🏓";
        readonly pong: "🏓";
        readonly help: "❓";
        readonly info: "ℹ️";
        readonly about: "📋";
        readonly invite: "✉️";
        readonly support: "🆘";
        readonly stats: "�";
        readonly uptime: "⏰";
        readonly status: "✅";
        readonly version: "🔢";
    };
    readonly Utility: {
        readonly icon: "🔧";
        readonly avatar: "🖼️";
        readonly user: "👤";
        readonly userInfo: "👤";
        readonly server: "🏰";
        readonly serverInfo: "🏰";
        readonly search: "�";
        readonly calculate: "�";
        readonly poll: "�";
        readonly reminder: "⏰";
        readonly translate: "🌐";
        readonly weather: "🌤️";
        readonly quote: "�";
        readonly say: "�";
        readonly embed: "📝";
        readonly color: "🎨";
        readonly qrcode: "�";
    };
    readonly Moderation: {
        readonly icon: "🛡️";
        readonly ban: "🔨";
        readonly unban: "✅";
        readonly kick: "�";
        readonly mute: "🔇";
        readonly unmute: "🔊";
        readonly warn: "⚠️";
        readonly warnings: "📋";
        readonly timeout: "⏱️";
        readonly clear: "🧹";
        readonly purge: "🗑️";
        readonly slowmode: "�";
        readonly lock: "�";
        readonly unlock: "�";
        readonly role: "�";
        readonly nickname: "✏️";
        readonly announce: "📢";
    };
    readonly Music: {
        readonly icon: "🎵";
        readonly play: "▶️";
        readonly pause: "⏸️";
        readonly stop: "⏹️";
        readonly skip: "⏭️";
        readonly previous: "⏮️";
        readonly shuffle: "🔀";
        readonly repeat: "🔁";
        readonly loop: "🔂";
        readonly queue: "📜";
        readonly nowPlaying: "🎶";
        readonly volume: "🔊";
        readonly volumeUp: "🔊";
        readonly volumeDown: "�";
        readonly lyrics: "📝";
        readonly search: "🔍";
        readonly playlist: "📑";
    };
    readonly Economy: {
        readonly icon: "💰";
        readonly balance: "�";
        readonly wallet: "👛";
        readonly bank: "🏦";
        readonly daily: "�";
        readonly weekly: "�";
        readonly work: "�";
        readonly beg: "🙏";
        readonly rob: "🔫";
        readonly deposit: "➡️";
        readonly withdraw: "⬅️";
        readonly transfer: "💸";
        readonly pay: "💳";
        readonly shop: "🛒";
        readonly buy: "🛍️";
        readonly sell: "💲";
        readonly inventory: "🎒";
        readonly leaderboard: "�";
        readonly coin: "🪙";
        readonly money: "�";
    };
    readonly Leveling: {
        readonly icon: "�";
        readonly level: "⬆️";
        readonly rank: "🏅";
        readonly leaderboard: "🏆";
        readonly xp: "✨";
        readonly experience: "⭐";
        readonly progress: "�";
        readonly rewards: "🎁";
        readonly milestone: "🎯";
        readonly boost: "⚡";
        readonly multiplier: "✖️";
    };
    readonly Fun: {
        readonly icon: "🎉";
        readonly meme: "😂";
        readonly joke: "🤣";
        readonly Eightball: "🎱";
        readonly dice: "🎲";
        readonly coinflip: "🪙";
        readonly rps: "✊";
        readonly trivia: "❓";
        readonly game: "�";
        readonly pet: "�";
        readonly feed: "🍖";
        readonly hug: "🤗";
        readonly kiss: "�";
        readonly slap: "�";
        readonly pat: "👏";
        readonly rate: "⭐";
        readonly ship: "💕";
        readonly avatar: "�️";
    };
    readonly Image: {
        readonly icon: "�️";
        readonly meme: "�";
        readonly avatar: "�️";
        readonly blur: "🌫️";
        readonly invert: "�";
        readonly greyscale: "⚫";
        readonly sepia: "�";
        readonly pixelate: "�";
        readonly deepfry: "🍳";
        readonly triggered: "😡";
        readonly wasted: "�";
        readonly jail: "�";
        readonly rainbow: "🌈";
    };
    readonly Tickets: {
        readonly icon: "🎫";
        readonly ticket: "🎫";
        readonly create: "➕";
        readonly close: "�";
        readonly delete: "�️";
        readonly claim: "✋";
        readonly unclaim: "🤚";
        readonly add: "👤";
        readonly remove: "�";
        readonly transcript: "�";
        readonly panel: "🎛️";
        readonly category: "�";
    };
    readonly Automation: {
        readonly icon: "🤖";
        readonly automod: "�️";
        readonly autorole: "🎭";
        readonly welcome: "👋";
        readonly goodbye: "�";
        readonly boost: "💎";
        readonly reaction: "😀";
        readonly trigger: "⚡";
        readonly filter: "�";
        readonly spam: "�";
        readonly invite: "�";
        readonly caps: "�";
        readonly links: "🌐";
        readonly mention: "�";
    };
    readonly Logging: {
        readonly icon: "📝";
        readonly log: "📝";
        readonly audit: "🔍";
        readonly modlog: "�";
        readonly message: "💬";
        readonly messageDelete: "🗑️";
        readonly messageEdit: "✏️";
        readonly member: "👤";
        readonly memberJoin: "➡️";
        readonly memberLeave: "⬅️";
        readonly role: "🎭";
        readonly roleCreate: "➕";
        readonly roleDelete: "➖";
        readonly channel: "�";
        readonly channelCreate: "➕";
        readonly channelDelete: "➖";
        readonly voice: "�";
        readonly voiceJoin: "�";
        readonly voiceLeave: "�";
    };
    readonly Config: {
        readonly icon: "⚙️";
        readonly settings: "⚙️";
        readonly setup: "🛠️";
        readonly config: "�";
        readonly prefix: "❗";
        readonly language: "🌐";
        readonly timezone: "�";
        readonly enable: "✅";
        readonly disable: "❌";
        readonly toggle: "�";
        readonly reset: "�";
        readonly import: "�";
        readonly export: "�";
        readonly backup: "�";
        readonly restore: "♻️";
    };
    readonly AI: {
        readonly icon: "🤖";
        readonly ai: "🤖";
        readonly chat: "�";
        readonly ask: "❓";
        readonly imagine: "🎨";
        readonly generate: "✨";
        readonly summarize: "📝";
        readonly translate: "�";
        readonly code: "💻";
        readonly assistant: "🤝";
        readonly gpt: "🧠";
    };
    readonly Developer: {
        readonly icon: "👨‍💻";
        readonly eval: "💻";
        readonly exec: "⚡";
        readonly reload: "�";
        readonly shutdown: "�";
        readonly restart: "🔄";
        readonly maintenance: "�";
        readonly debug: "�";
        readonly logs: "�";
        readonly database: "�";
        readonly cache: "�️";
        readonly guild: "🏰";
        readonly user: "�";
        readonly emit: "�";
        readonly test: "🧪";
    };
    readonly Status: {
        readonly icon: "✅";
        readonly success: "✅";
        readonly error: "❌";
        readonly warning: "⚠️";
        readonly info: "ℹ️";
        readonly loading: "⏳";
        readonly processing: "⚙️";
        readonly pending: "�";
        readonly completed: "✔️";
        readonly failed: "✖️";
        readonly cancelled: "🚫";
        readonly online: "🟢";
        readonly offline: "�";
        readonly idle: "�";
        readonly dnd: "⛔";
    };
};
/**
 * Get a random emoji from a specific category
 * @param category The category to get a random emoji from
 * @returns A random emoji from the category
 */
export declare function getRandomEmoji(category: keyof typeof AllCategories): string;
/**
 * Get all emojis from a category as an array
 * @param category The category to get emojis from
 * @returns Array of emojis (excluding the category icon)
 */
export declare function getCategoryEmojis(category: keyof typeof AllCategories): string[];
/**
 * Type for category names
 */
export type CategoryName = keyof typeof AllCategories;
//# sourceMappingURL=emoji.d.ts.map