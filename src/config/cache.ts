import { Redis } from "ioredis";
import { env } from "./env.js";

// In-memory cache store
interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export class AniwatchAPICache {
    private static instance: AniwatchAPICache | null = null;

    private client: Redis | null;
    private memoryCache: Map<string, CacheEntry<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;
    public enabled: boolean = false;
    public useMemoryCache: boolean = false;

    static enabled = false;
    // 1 year in seconds: 365 days * 24 hours * 60 minutes * 60 seconds
    static DEFAULT_CACHE_EXPIRY_SECONDS = 365 * 24 * 60 * 60 as const;
    static CACHE_EXPIRY_HEADER_NAME = "Aniwatch-Cache-Expiry" as const;

    constructor() {
        const redisConnURL = env.ANIWATCH_API_REDIS_CONN_URL;
        const useRedis = Boolean(redisConnURL);
        
        // Enable caching always (either Redis or in-memory)
        this.enabled = AniwatchAPICache.enabled = true;
        this.useMemoryCache = !useRedis;
        this.client = useRedis ? new Redis(String(redisConnURL)) : null;
        
        // Start cleanup interval for in-memory cache
        if (this.useMemoryCache) {
            this.startCleanupInterval();
        }
    }

    static getInstance() {
        if (!AniwatchAPICache.instance) {
            AniwatchAPICache.instance = new AniwatchAPICache();
        }
        return AniwatchAPICache.instance;
    }

    /**
     * @param expirySeconds set to 1 year by default
     */
    async getOrSet<T>(
        dataGetter: () => Promise<T>,
        key: string,
        expirySeconds: number = AniwatchAPICache.DEFAULT_CACHE_EXPIRY_SECONDS
    ) {
        if (this.useMemoryCache) {
            // Use in-memory cache
            const cached = this.memoryCache.get(key);
            const now = Date.now();
            
            if (cached && cached.expiresAt > now) {
                return cached.data as T;
            }
            
            // Fetch fresh data
            const data = await dataGetter();
            this.memoryCache.set(key, {
                data,
                expiresAt: now + (expirySeconds * 1000)
            });
            return data;
        } else {
            // Use Redis cache
            const cachedData = (await this.client?.get?.(key)) || null;
            let data: T | null = null;
            
            try {
                data = cachedData ? (JSON.parse(String(cachedData)) as T) : null;
            } catch (err) {
                data = null;
            }

            if (!data) {
                data = await dataGetter();
                await this.client?.set?.(
                    key,
                    JSON.stringify(data),
                    "EX",
                    expirySeconds
                );
            }
            return data;
        }
    }

    /**
     * Start periodic cleanup of expired entries in memory cache
     */
    private startCleanupInterval() {
        // Run cleanup every hour
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            let cleanedCount = 0;
            
            for (const [key, entry] of this.memoryCache.entries()) {
                if (entry.expiresAt <= now) {
                    this.memoryCache.delete(key);
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                console.info(
                    `aniwatch-api cleaned ${cleanedCount} expired cache entries`
                );
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    /**
     * Clear all cache entries (useful for updates)
     */
    clearCache() {
        if (this.useMemoryCache) {
            const size = this.memoryCache.size;
            this.memoryCache.clear();
            console.info(
                `aniwatch-api cleared ${size} in-memory cache entries`
            );
        } else {
            console.warn(
                "Cache clearing is only supported for in-memory cache"
            );
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        if (this.useMemoryCache) {
            return {
                type: 'memory',
                size: this.memoryCache.size,
                enabled: this.enabled
            };
        }
        return {
            type: 'redis',
            enabled: this.enabled
        };
    }

    closeConnection() {
        // Stop cleanup interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Close Redis connection if applicable
        this.client
            ?.quit()
            ?.then(() => {
                this.client = null;
                AniwatchAPICache.instance = null;
                console.info(
                    "aniwatch-api redis connection closed and cache instance reset"
                );
            })
            .catch((err) => {
                console.error(
                    `aniwatch-api error while closing redis connection: ${err}`
                );
            });
        
        // Clear in-memory cache
        if (this.useMemoryCache) {
            this.memoryCache.clear();
        }
    }
}

export const cache = AniwatchAPICache.getInstance();
