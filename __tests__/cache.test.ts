import { expect, test, describe, beforeEach } from "vitest";
import { AniwatchAPICache } from "../src/config/cache.js";

describe("In-Memory Cache", () => {
    let cache: AniwatchAPICache;

    beforeEach(() => {
        // Create a new cache instance for each test
        cache = new (AniwatchAPICache as any)();
    });

    test("should use in-memory cache when Redis is not configured", () => {
        expect(cache.enabled).toBe(true);
        expect(cache.useMemoryCache).toBe(true);
    });

    test("should cache and retrieve data", async () => {
        const testData = { message: "Hello, World!" };
        const cacheKey = "test-key";
        
        let callCount = 0;
        const dataGetter = async () => {
            callCount++;
            return testData;
        };

        // First call should fetch and cache
        const result1 = await cache.getOrSet(dataGetter, cacheKey, 60);
        expect(result1).toEqual(testData);
        expect(callCount).toBe(1);

        // Second call should retrieve from cache
        const result2 = await cache.getOrSet(dataGetter, cacheKey, 60);
        expect(result2).toEqual(testData);
        expect(callCount).toBe(1); // Should still be 1, not 2
    });

    test("should expire cached data after TTL", async () => {
        const testData = { message: "Hello, World!" };
        const cacheKey = "test-expiry-key";
        
        let callCount = 0;
        const dataGetter = async () => {
            callCount++;
            return testData;
        };

        // Cache with 1 second TTL
        await cache.getOrSet(dataGetter, cacheKey, 1);
        expect(callCount).toBe(1);

        // Wait for expiry
        await new Promise(resolve => setTimeout(resolve, 1100));

        // Should fetch fresh data
        await cache.getOrSet(dataGetter, cacheKey, 1);
        expect(callCount).toBe(2);
    });

    test("should get cache stats", () => {
        const stats = cache.getCacheStats();
        expect(stats.type).toBe('memory');
        expect(stats.enabled).toBe(true);
        expect(typeof stats.size).toBe('number');
    });

    test("should clear cache", async () => {
        const testData = { message: "Hello, World!" };
        const cacheKey = "test-clear-key";
        
        let callCount = 0;
        const dataGetter = async () => {
            callCount++;
            return testData;
        };

        // Cache data
        await cache.getOrSet(dataGetter, cacheKey, 60);
        expect(callCount).toBe(1);

        // Clear cache
        cache.clearCache();

        // Should fetch fresh data after clear
        await cache.getOrSet(dataGetter, cacheKey, 60);
        expect(callCount).toBe(2);
    });

    test("should use 1 year default expiry", () => {
        const expectedExpiry = 365 * 24 * 60 * 60; // 1 year in seconds
        expect(AniwatchAPICache.DEFAULT_CACHE_EXPIRY_SECONDS).toBe(expectedExpiry);
    });
});
