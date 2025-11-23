import { log } from '../utils/logger';

export abstract class BaseService {
    public abstract name: string;

    constructor() {
        // log.info(`Service loaded: ${this.name}`); // Cannot access abstract property in constructor
    }

    protected logLoaded() {
        log.info(`Service loaded: ${this.name}`);
    }
}
