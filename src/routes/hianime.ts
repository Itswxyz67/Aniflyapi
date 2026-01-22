import { Hono } from "hono";
import { HiAnime } from "aniwatch";
import { ROUTE_CACHE_CONFIG } from "../config/cacheHeaders.js";
import type { ServerContext } from "../config/context.js";

const hianime = new HiAnime.Scraper();
const hianimeRouter = new Hono<ServerContext>();

// /api/v2/hianime
hianimeRouter.get("/", (c) => c.redirect("/", 301));

// /api/v2/hianime/home
hianimeRouter.get("/home", async (c) => {
    const data = await hianime.getHomePage();
    
    c.header("Cache-Control", ROUTE_CACHE_CONFIG.home);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/azlist/{sortOption}?page={page}
hianimeRouter.get("/azlist/:sortOption", async (c) => {
    const sortOption = decodeURIComponent(
        c.req.param("sortOption").trim().toLowerCase()
    ) as HiAnime.AZListSortOptions;
    const page: number =
        Number(decodeURIComponent(c.req.query("page") || "")) || 1;

    const data = await hianime.getAZList(sortOption, page);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.azList);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/qtip/{animeId}
hianimeRouter.get("/qtip/:animeId", async (c) => {
    const animeId = decodeURIComponent(c.req.param("animeId").trim());

    const data = await hianime.getQtipInfo(animeId);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.qtip);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/category/{name}?page={page}
hianimeRouter.get("/category/:name", async (c) => {
    const categoryName = decodeURIComponent(
        c.req.param("name").trim()
    ) as HiAnime.AnimeCategories;
    const page: number =
        Number(decodeURIComponent(c.req.query("page") || "")) || 1;

    const data = await hianime.getCategoryAnime(categoryName, page);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.category);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/genre/{name}?page={page}
hianimeRouter.get("/genre/:name", async (c) => {
    const genreName = decodeURIComponent(c.req.param("name").trim());
    const page: number =
        Number(decodeURIComponent(c.req.query("page") || "")) || 1;

    const data = await hianime.getGenreAnime(genreName, page);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.genre);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/producer/{name}?page={page}
hianimeRouter.get("/producer/:name", async (c) => {
    const producerName = decodeURIComponent(c.req.param("name").trim());
    const page: number =
        Number(decodeURIComponent(c.req.query("page") || "")) || 1;

    const data = await hianime.getProducerAnimes(producerName, page);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.producer);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/schedule?date={date}&tzOffset={tzOffset}
hianimeRouter.get("/schedule", async (c) => {
    const date = decodeURIComponent(c.req.query("date") || "");
    let tzOffset = Number(
        decodeURIComponent(c.req.query("tzOffset") || "-330")
    );
    tzOffset = isNaN(tzOffset) ? -330 : tzOffset;

    const data = await hianime.getEstimatedSchedule(date, tzOffset);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.schedule);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/search?q={query}&page={page}&filters={...filters}
hianimeRouter.get("/search", async (c) => {
    let { q: query, page, ...filters } = c.req.query();

    query = decodeURIComponent(query || "");
    const pageNo = Number(decodeURIComponent(page || "")) || 1;

    const data = await hianime.search(query, pageNo, filters);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.search);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/search/suggestion?q={query}
hianimeRouter.get("/search/suggestion", async (c) => {
    const query = decodeURIComponent(c.req.query("q") || "");

    const data = await hianime.searchSuggestions(query);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.search);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/anime/{animeId}
hianimeRouter.get("/anime/:animeId", async (c) => {
    const animeId = decodeURIComponent(c.req.param("animeId").trim());

    const data = await hianime.getInfo(animeId);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.animeDetail);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/episode/servers?animeEpisodeId={id}
hianimeRouter.get("/episode/servers", async (c) => {
    const animeEpisodeId = decodeURIComponent(
        c.req.query("animeEpisodeId") || ""
    );

    const data = await hianime.getEpisodeServers(animeEpisodeId);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.episodes);
    return c.json({ status: 200, data }, { status: 200 });
});

// episodeId=steinsgate-3?ep=230
// /api/v2/hianime/episode/sources?animeEpisodeId={episodeId}?server={server}&category={category (dub or sub)}
hianimeRouter.get("/episode/sources", async (c) => {
    const animeEpisodeId = decodeURIComponent(
        c.req.query("animeEpisodeId") || ""
    );
    const server = decodeURIComponent(
        c.req.query("server") || HiAnime.Servers.VidStreaming
    ) as HiAnime.AnimeServers;
    const category = decodeURIComponent(c.req.query("category") || "sub") as
        | "sub"
        | "dub"
        | "raw";

    const data = await hianime.getEpisodeSources(animeEpisodeId, server, category);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.episodes);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/anime/{anime-id}/episodes
hianimeRouter.get("/anime/:animeId/episodes", async (c) => {
    const animeId = decodeURIComponent(c.req.param("animeId").trim());

    const data = await hianime.getEpisodes(animeId);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.episodes);
    return c.json({ status: 200, data }, { status: 200 });
});

// /api/v2/hianime/anime/{anime-id}/next-episode-schedule
hianimeRouter.get("/anime/:animeId/next-episode-schedule", async (c) => {
    const animeId = decodeURIComponent(c.req.param("animeId").trim());

    const data = await hianime.getNextEpisodeSchedule(animeId);

    c.header("Cache-Control", ROUTE_CACHE_CONFIG.schedule);
    return c.json({ status: 200, data }, { status: 200 });
});

export { hianimeRouter };
