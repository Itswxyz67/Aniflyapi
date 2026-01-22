import { expect, test, describe } from "vitest";
import { CACHE_HEADERS, ROUTE_CACHE_CONFIG } from "../src/config/cacheHeaders.js";

describe("Cache Headers Configuration", () => {
    test("should have correct 1-year cache header", () => {
        expect(CACHE_HEADERS.YEAR).toBe("public, s-maxage=31536000, immutable");
    });

    test("should have correct 1-day cache header with stale-while-revalidate", () => {
        expect(CACHE_HEADERS.DAY).toBe("public, s-maxage=86400, stale-while-revalidate=604800");
    });

    test("should have correct 1-month cache header with stale-while-revalidate", () => {
        expect(CACHE_HEADERS.MONTH).toBe("public, s-maxage=2592000, stale-while-revalidate=7776000");
    });

    test("should configure anime detail with 1-year cache", () => {
        expect(ROUTE_CACHE_CONFIG.animeDetail).toBe(CACHE_HEADERS.YEAR);
    });

    test("should configure episodes with 1-year cache", () => {
        expect(ROUTE_CACHE_CONFIG.episodes).toBe(CACHE_HEADERS.YEAR);
    });

    test("should configure home with 1-day cache", () => {
        expect(ROUTE_CACHE_CONFIG.home).toBe(CACHE_HEADERS.DAY);
    });

    test("should configure A-Z list with 1-month cache", () => {
        expect(ROUTE_CACHE_CONFIG.azList).toBe(CACHE_HEADERS.MONTH);
    });

    test("should configure schedule with 1-year cache", () => {
        expect(ROUTE_CACHE_CONFIG.schedule).toBe(CACHE_HEADERS.YEAR);
    });

    test("should configure category with 1-month cache", () => {
        expect(ROUTE_CACHE_CONFIG.category).toBe(CACHE_HEADERS.MONTH);
    });

    test("should configure genre with 1-month cache", () => {
        expect(ROUTE_CACHE_CONFIG.genre).toBe(CACHE_HEADERS.MONTH);
    });

    test("should configure producer with 1-month cache", () => {
        expect(ROUTE_CACHE_CONFIG.producer).toBe(CACHE_HEADERS.MONTH);
    });

    test("should configure search with 1-month cache", () => {
        expect(ROUTE_CACHE_CONFIG.search).toBe(CACHE_HEADERS.MONTH);
    });

    test("should configure qtip with 1-year cache", () => {
        expect(ROUTE_CACHE_CONFIG.qtip).toBe(CACHE_HEADERS.YEAR);
    });
});
