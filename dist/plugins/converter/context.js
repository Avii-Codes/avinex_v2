"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const discord_js_1 = require("discord.js");
class Context {
    constructor(client, user, member, guild, channel, args, raw) {
        this.client = client;
        this.user = user;
        this.member = member;
        this.guild = guild;
        this.channel = channel;
        this.args = args;
        this.raw = raw;
    }
    async reply(content) {
        const payload = typeof content === 'string' ? { content } : content;
        if (!this.raw && this.channel) {
            if ('send' in this.channel) {
                return this.channel.send(payload);
            }
            return;
        }
        if (this.raw instanceof discord_js_1.ChatInputCommandInteraction) {
            if (this.raw.replied || this.raw.deferred) {
                return this.raw.editReply(payload);
            }
            return this.raw.reply(payload);
        }
        else if (this.raw instanceof discord_js_1.Message) {
            return this.raw.reply(payload);
        }
        // AutocompleteInteraction cannot reply
    }
    async edit(content) {
        // For virtual, we can't edit the "original response" easily unless we track it. 
        // For now, just send a new message or ignore.
        const payload = typeof content === 'string' ? { content } : content;
        if (!this.raw && this.channel) {
            if ('send' in this.channel) {
                return this.channel.send(payload);
            }
            return;
        }
        if (this.raw instanceof discord_js_1.ChatInputCommandInteraction) {
            return this.raw.editReply(payload);
        }
        else if (this.raw instanceof discord_js_1.Message) {
            if (this.channel && 'send' in this.channel) {
                return this.channel.send(payload);
            }
        }
    }
    async follow(content) {
        const payload = typeof content === 'string' ? { content } : content;
        if (!this.raw && this.channel) {
            if ('send' in this.channel) {
                return this.channel.send(payload);
            }
            return;
        }
        if (this.raw instanceof discord_js_1.ChatInputCommandInteraction) {
            return this.raw.followUp(payload);
        }
        else if (this.raw instanceof discord_js_1.Message) {
            return this.raw.reply(payload);
        }
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map