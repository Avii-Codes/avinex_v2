import { ChatInputCommandInteraction, Message, AutocompleteInteraction } from 'discord.js';
export interface VirtualTrigger {
    content: string;
    author: {
        id: string;
        tag: string;
        bot: boolean;
    };
    member?: any;
    guild?: any;
    channel?: any;
}
export declare function executeHybridCommand(trigger: Message | ChatInputCommandInteraction | AutocompleteInteraction | VirtualTrigger, isAutocomplete?: boolean): Promise<import("discord.js").InteractionResponse<boolean> | import("discord.js").OmitPartialGroupDMChannel<Message<any>> | undefined>;
//# sourceMappingURL=execution.d.ts.map