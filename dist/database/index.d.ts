export declare class DatabaseManager {
    private static instance;
    private maxRetries;
    private retryInterval;
    private constructor();
    static getInstance(): DatabaseManager;
    connect(uri: string): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    private setupListeners;
}
export declare const db: DatabaseManager;
//# sourceMappingURL=index.d.ts.map