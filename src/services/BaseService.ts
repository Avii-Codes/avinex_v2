import { log } from '../utils/logger';
import { FunctionDeclaration } from '@google/generative-ai';

import { User, TextBasedChannel } from 'discord.js';
import { ExtendedClient } from '../client/ExtendedClient';

export interface AIToolContext {
    user: User;
    channel: TextBasedChannel;
    client: ExtendedClient;
}

export interface AITool {
    declaration: FunctionDeclaration;
    execute: (args: any, context: AIToolContext) => Promise<string>;
    isCommand?: boolean;
}

export abstract class BaseService {
    public abstract name: string;

    constructor() {
        // log.info(`Service loaded: ${this.name}`); // Cannot access abstract property in constructor
    }

    protected logLoaded() {
        log.info(`Service loaded: ${this.name}`);
    }

    public getAITools(): AITool[] {
        return [];
    }
}
