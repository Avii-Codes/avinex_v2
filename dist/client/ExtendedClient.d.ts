import { SapphireClient } from '@sapphire/framework';
import { BaseSystem } from '../systems/BaseSystem';
export declare class ExtendedClient extends SapphireClient {
    systems: Map<string, BaseSystem>;
    constructor();
    init(): Promise<void>;
    private loadSystems;
    private loadEvents;
    destroy(): Promise<void>;
}
//# sourceMappingURL=ExtendedClient.d.ts.map