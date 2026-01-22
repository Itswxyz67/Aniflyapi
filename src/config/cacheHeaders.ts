/**
 * Cache-Control header configurations for Vercel Edge caching
 * Following the recommended cache policy for optimal CDN performance
 */

export const CACHE_HEADERS = {
    // 1 year cache for immutable content (anime details, episodes, schedule)
    YEAR: "public, s-maxage=31536000, immutable",
    
    // 1 day cache with 7-day stale-while-revalidate for homepage
    // Allows serving stale content while fetching fresh data in background
    // Ensures users always get fast responses even during revalidation
    DAY: "public, s-maxage=86400, stale-while-revalidate=604800",
    
    // 1 month cache with 90-day stale-while-revalidate for A-Z list
    // Long stale period is acceptable since anime lists change infrequently
    // Provides resilience during peak traffic or temporary backend issues
    MONTH: "public, s-maxage=2592000, stale-while-revalidate=7776000",
} as const;

/**
 * Route-specific cache configurations
 */
export const ROUTE_CACHE_CONFIG = {
    // Anime detail pages - rarely change
    animeDetail: CACHE_HEADERS.YEAR,
    
    // Episode pages - content is immutable
    episodes: CACHE_HEADERS.YEAR,
    
    // Homepage - trending and latest updates
    home: CACHE_HEADERS.DAY,
    
    // A-Z anime list - changes occasionally
    azList: CACHE_HEADERS.MONTH,
    
    // Schedule page - rarely changes
    schedule: CACHE_HEADERS.YEAR,
    
    // Category/Genre/Producer pages - similar to A-Z list
    category: CACHE_HEADERS.MONTH,
    genre: CACHE_HEADERS.MONTH,
    producer: CACHE_HEADERS.MONTH,
    
    // Search results - moderate caching
    search: CACHE_HEADERS.MONTH,
    
    // Quick tip info - rarely changes
    qtip: CACHE_HEADERS.YEAR,
} as const;
