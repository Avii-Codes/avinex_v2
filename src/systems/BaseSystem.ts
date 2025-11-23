import { ExtendedClient } from '../client/ExtendedClient';
import { ISystem } from '../types/systems';
import { log } from '../utils/logger';

export abstract class BaseSystem implements ISystem {
    public abstract name: string;
    protected client!: ExtendedClient;

    public async init(client: ExtendedClient): Promise<void> {
        this.client = client;
        log.info(`Initializing system: ${this.name}`);
        await this.onInit();
    }

    protected abstract onInit(): Promise<void>;
}
