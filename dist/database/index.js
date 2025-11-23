"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseManager = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
class DatabaseManager {
    constructor() {
        this.maxRetries = 5;
        this.retryInterval = 5000;
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    async connect(uri) {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                logger_1.log.info('Connecting to MongoDB...');
                await mongoose_1.default.connect(uri);
                logger_1.log.success('Connected to MongoDB successfully!');
                this.setupListeners();
                return;
            }
            catch (error) {
                retries++;
                logger_1.log.error(`Failed to connect to MongoDB (Attempt ${retries}/${this.maxRetries})`, error);
                if (retries < this.maxRetries) {
                    logger_1.log.info(`Retrying in ${this.retryInterval / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.retryInterval));
                }
                else {
                    logger_1.log.error('Max retries reached. Exiting...');
                    process.exit(1);
                }
            }
        }
    }
    async disconnect() {
        try {
            await mongoose_1.default.disconnect();
            logger_1.log.info('Disconnected from MongoDB.');
        }
        catch (error) {
            logger_1.log.error('Error disconnecting from MongoDB:', error);
        }
    }
    isConnected() {
        return mongoose_1.default.connection.readyState === 1;
    }
    setupListeners() {
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.log.warn('MongoDB disconnected! Attempting to reconnect...');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            logger_1.log.success('MongoDB reconnected!');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.log.error('MongoDB connection error:', err);
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
exports.DatabaseManager = DatabaseManager;
exports.db = DatabaseManager.getInstance();
//# sourceMappingURL=index.js.map