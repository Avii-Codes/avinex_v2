import { log } from './logger';

export class ErrorHandler {
    public static handle(error: Error, context: string): void {
        log.error(`[${context}] An error occurred:`, error);
        // Future: Integration with Sentry or other error tracking services
    }
}
