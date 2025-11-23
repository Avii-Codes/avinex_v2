import { HybridCommand, SubCommandGroup } from './types';
export declare class CommandRegistry {
    private commands;
    private aliases;
    private subcommands;
    private fileFingerprints;
    register(cmd: HybridCommand, filePath: string, category: string, parentGroup?: string): void;
    registerGroup(group: SubCommandGroup): void;
    get(name: string): HybridCommand | undefined;
    getByAlias(alias: string): HybridCommand | undefined;
    getGroup(name: string): SubCommandGroup | undefined;
    getAll(): IterableIterator<HybridCommand>;
    getAllGroups(): IterableIterator<SubCommandGroup>;
    private calculateFingerprint;
}
export declare const registry: CommandRegistry;
//# sourceMappingURL=registry.d.ts.map