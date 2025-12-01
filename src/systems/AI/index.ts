import { BaseSystem } from '../BaseSystem';
import { AIController } from './controller';
import { User, TextBasedChannel, MessagePayload, MessageCreateOptions } from 'discord.js';
import { log } from '../../utils/logger';

export default class AISystem extends BaseSystem {
    public name = 'AI';
    private controller: AIController;

    constructor() {
        super();
        this.controller = new AIController();
    }

    protected async onInit(): Promise<void> {
        log.info('AI System initialized. Nex is ready.');
    }

    public async ask(prompt: string, user: User, channel: TextBasedChannel, onProgress?: (status: string) => Promise<void>): Promise<string | MessagePayload | MessageCreateOptions> {
        return this.controller.ask(prompt, user, channel, this.client, onProgress);
    }
}
