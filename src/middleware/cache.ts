import type { MiddlewareHandler } from "hono";

// No-op middleware - Cache-Control headers are now set per route
export const cacheControl: MiddlewareHandler = async (_c, next) => {
    await next();
};

