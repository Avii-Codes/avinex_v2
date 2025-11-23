import mongoose from 'mongoose';
import { log } from '../utils/logger';

export class DatabaseManager {
    private static instance: DatabaseManager;
    private maxRetries = 5;
    private retryInterval = 5000;

    private constructor() { }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async connect(uri: string): Promise<void> {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                log.info('Connecting to MongoDB...');
                await mongoose.connect(uri);
                log.success('Connected to MongoDB successfully!');

                this.setupListeners();
                return;
            } catch (error) {
                retries++;
                log.error(`Failed to connect to MongoDB (Attempt ${retries}/${this.maxRetries})`, error);

                if (retries < this.maxRetries) {
                    log.info(`Retrying in ${this.retryInterval / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryInterval));
                } else {
                    log.error('Max retries reached. Exiting...');
                    process.exit(1);
                }
            }
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            log.info('Disconnected from MongoDB.');
        } catch (error) {
            log.error('Error disconnecting from MongoDB:', error);
        }
    }

    public isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }

    private setupListeners() {
        mongoose.connection.on('disconnected', () => {
            log.warn('MongoDB disconnected! Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            log.success('MongoDB reconnected!');
        });

        mongoose.connection.on('error', (err) => {
            log.error('MongoDB connection error:', err);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }
}

export const db = DatabaseManager.getInstance();
