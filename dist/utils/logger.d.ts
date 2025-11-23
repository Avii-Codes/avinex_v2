import winston from 'winston';
export declare const logger: winston.Logger;
export declare const box: {
    create: (content: string, style?: "single" | "double" | "round" | "bold" | "classic", options?: any) => string;
    banner: (content: string, options?: any) => string;
    info: (content: string) => string;
    warn: (content: string) => string;
    error: (content: string) => string;
    success: (content: string) => string;
};
export declare function displayBanner(): void;
export declare const log: {
    info: (message: string, meta?: any) => winston.Logger;
    warn: (message: string, meta?: any) => winston.Logger;
    error: (message: string, error?: any) => void;
    debug: (message: string, meta?: any) => winston.Logger;
    verbose: (message: string, meta?: any) => winston.Logger;
    command: (commandName: string, user: string, args?: any) => void;
    category: (categoryName: string, commandCount: number, enabled?: boolean) => void;
    success: (message: string) => void;
    loading: (message: string) => void;
    separator: () => void;
    section: (title: string) => void;
};
//# sourceMappingURL=logger.d.ts.map