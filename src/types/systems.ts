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
    // Marker interface for controllers
}

export interface IManager {
    // Marker interface for managers
}
