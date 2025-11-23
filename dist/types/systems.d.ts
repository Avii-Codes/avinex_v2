import { ExtendedClient } from '../client/ExtendedClient';
export interface ISystemConfig {
    enabled: boolean;
    [key: string]: any;
}
export interface ISystem {
    name: string;
    init(client: ExtendedClient): Promise<void>;
}
export interface IController {
}
export interface IManager {
}
//# sourceMappingURL=systems.d.ts.map