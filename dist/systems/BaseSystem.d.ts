import { ExtendedClient } from '../client/ExtendedClient';
import { ISystem } from '../types/systems';
export declare abstract class BaseSystem implements ISystem {
    abstract name: string;
    protected client: ExtendedClient;
    init(client: ExtendedClient): Promise<void>;
    protected abstract onInit(): Promise<void>;
}
//# sourceMappingURL=BaseSystem.d.ts.map