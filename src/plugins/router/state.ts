import Redis from 'ioredis';

const ENABLE_REDIS = process.env.ENABLE_REDIS === 'true';
const DEV_MODE = process.env.DEV_MODE === 'true';
const MAX_ENTRIES = 10000;

class StateManagerImpl {
    private memoryState = new Map<string, any>();
    private memoryGroups = new Map<string, Set<string>>();
    private redis: Redis | null = null;

    constructor() {
        if (ENABLE_REDIS && process.env.REDIS_URI) {
            this.redis = new Redis(process.env.REDIS_URI, {
                lazyConnect: true,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 3000);
                    if (DEV_MODE) console.log(`[Redis] Retrying connection in ${delay}ms...`);
                    return delay;
                }
            });

            this.redis.on('error', (err) => {
                if (DEV_MODE) console.error('[Redis] Connection Error:', err.message);
            });

            this.redis.on('connect', () => {
                if (DEV_MODE) console.log('[Redis] Connected successfully.');
            });

            this.redis.connect().catch(() => { /* Handled by error listener */ });
        }
    }

    /**
     * Inject a custom Redis client
     */
    public setRedisClient(client: Redis) {
        if (this.redis) {
            this.redis.disconnect();
        }
        this.redis = client;
    }

    /**
     * Set state with TTL
     */
    public async set(token: string, data: any, ttl: number = 60): Promise<void> {
        // 1. Memory Overflow Guard
        if (this.memoryState.size >= MAX_ENTRIES) {
            if (DEV_MODE) console.warn('[Router State] Memory limit reached. Running GC...');
            // Simple GC: Delete the oldest 10% of entries
            // Since Map preserves insertion order, the first keys are the oldest
            let count = 0;
            const limit = MAX_ENTRIES / 10;
            for (const key of this.memoryState.keys()) {
                this.memoryState.delete(key);
                count++;
                if (count >= limit) break;
            }
        }

        // L1: Memory
        this.memoryState.set(token, data);
        setTimeout(() => this.memoryState.delete(token), ttl * 1000);

        // L2: Redis (Fire and Forget)
        if (this.redis) {
            this.safeRedis(async () => {
                const serialized = this.safeStringify(data);
                if (serialized) {
                    await this.redis!.setex(`router:state:${token}`, ttl, serialized);
                }
            });
        }
    }

    /**
     * Get state (L1 -> L2)
     */
    public async get(token: string): Promise<any | null> {
        // 1. Check L1
        if (this.memoryState.has(token)) {
            return this.memoryState.get(token);
        }

        // 2. Check L2
        if (this.redis) {
            const data = await this.safeRedis(async () => {
                const raw = await this.redis!.get(`router:state:${token}`);
                return raw ? JSON.parse(raw) : null;
            });

            if (data) {
                // Rehydrate L1
                this.memoryState.set(token, data);
                // Short TTL for rehydrated cache (10s) to prevent ghost entries
                setTimeout(() => this.memoryState.delete(token), 10000);

                if (DEV_MODE) console.log(`[Router State] Rehydrated token: ${token}`);
                return data;
            }
        }

        return null;
    }

    /**
     * Delete state
     */
    public async delete(token: string): Promise<void> {
        this.memoryState.delete(token);

        if (this.redis) {
            this.safeRedis(async () => {
                await this.redis!.del(`router:state:${token}`);
            });
        }
    }

    /**
     * Add token to a message group
     */
    public async addToGroup(groupId: string, token: string, ttl: number = 300): Promise<void> {
        // L1
        if (!this.memoryGroups.has(groupId)) {
            this.memoryGroups.set(groupId, new Set());
        }
        this.memoryGroups.get(groupId)!.add(token);

        // L2
        if (this.redis) {
            this.safeRedis(async () => {
                const key = `router:group:${groupId}`;
                await this.redis!.sadd(key, token);
                await this.redis!.expire(key, ttl);
            });
        }
    }

    /**
     * Delete entire group
     */
    public async deleteGroup(groupId: string): Promise<void> {
        if (DEV_MODE) console.log(`[Router State] Deleting group: ${groupId}`);

        // L1 Cleanup
        if (this.memoryGroups.has(groupId)) {
            const tokens = this.memoryGroups.get(groupId)!;
            for (const token of tokens) {
                this.memoryState.delete(token);
            }
            this.memoryGroups.delete(groupId);
        }

        // L2 Cleanup
        if (this.redis) {
            this.safeRedis(async () => {
                const groupKey = `router:group:${groupId}`;

                // Get all tokens in the group
                const tokens = await this.redis!.smembers(groupKey);

                if (tokens.length > 0) {
                    const pipeline = this.redis!.pipeline();

                    // Delete all state keys
                    const stateKeys = tokens.map(t => `router:state:${t}`);
                    pipeline.unlink(...stateKeys); // Async delete

                    // Delete group key
                    pipeline.unlink(groupKey);

                    await pipeline.exec();
                } else {
                    await this.redis!.unlink(groupKey);
                }
            });
        }
    }

    /**
     * Safe JSON Stringify
     * Prevents crashes from circular references
     */
    private safeStringify(data: any): string | null {
        try {
            return JSON.stringify(data);
        } catch (error) {
            if (DEV_MODE) console.error('[Router State] Failed to serialize state (Circular reference?):', error);
            return null;
        }
    }

    /**
     * Safe Redis Wrapper
     * Catches errors and allows fallback to memory-only operation
     */
    private async safeRedis<T>(operation: () => Promise<T>): Promise<T | null> {
        try {
            return await operation();
        } catch (error: any) {
            if (DEV_MODE) console.error('[Redis] Operation Failed:', error.message);
            return null;
        }
    }
}

export const StateManager = new StateManagerImpl();
