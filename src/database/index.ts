import mongoose from 'mongoose';
import { log } from '../utils/logger';

export class DatabaseManager {
    private static instance: DatabaseManager;
    private isShuttingDown: boolean = false;

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async connect(uri: string): Promise<void> {
        try {
            mongoose.set('strictQuery', true);

            // Setup connection events
            mongoose.connection.on('connected', () => {
                log.success('MongoDB connected successfully');
            });

            mongoose.connection.on('err', (err) => {
                log.error(`MongoDB connection error: ${err}`);
            });

            mongoose.connection.on('disconnected', () => {
                if (this.isShuttingDown) {
                    log.info('MongoDB disconnected (shutdown).');
                } else {
                    log.warn('MongoDB disconnected! Attempting to reconnect...');
                }
            });

            await mongoose.connect(uri);
        } catch (error) {
            log.error('Failed to connect to MongoDB:', error);
            // Don't exit process here, let the caller handle it
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        this.isShuttingDown = true;
        try {
            await mongoose.disconnect();
            log.success('Disconnected from MongoDB.');
        } catch (error) {
            log.error('Error disconnecting from MongoDB:', error);
        }
    }
}

export const db = DatabaseManager.getInstance();
