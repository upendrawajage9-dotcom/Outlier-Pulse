import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { listSeedChannels } from "@/lib/mockData";
import { analyzeChannel } from "@/lib/youtube";
import type { ChannelAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Lazily initialize Upstash Redis client from environment variables.
 * Returns null if credentials are not configured or initialization fails.
 */
function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (error) {
    console.warn("[Upstash Redis] Client initialization error:", error);
    return null;
  }
}

interface CachedPayload {
  success: boolean;
  ok: boolean;
  isMockData: boolean;
  analysis: ChannelAnalysis;
  seeds: ReturnType<typeof listSeedChannels>;
  apiConfigured: boolean;
  alert?: string;
}

/**
 * GET /api/analyze?query={channel_or_handle}
 *
 * Upstash Redis Caching:
 * 1. Checks `cache:channel:${normalizedQuery}` in Redis before querying live API.
 * 2. On cache hit: Returns cached payload instantly with `isCached: true`.
 * 3. On cache miss: Fetches channel intelligence, saves to Redis (TTL = 86400s / 24h), and returns.
 */
export async function GET(request: NextRequest) {
  const rawQuery =
    request.nextUrl.searchParams.get("query") ??
    request.nextUrl.searchParams.get("q") ??
    "Veritasium";
  const query = rawQuery.trim();
  const normalizedKey = `cache:channel:${query.toLowerCase().replace(/\s+/g, "")}`;

  const redis = getRedisClient();

  // 1. Try cache lookup if Redis is available
  if (redis) {
    try {
      const cached = await redis.get<CachedPayload>(normalizedKey);
      if (cached && cached.analysis) {
        return NextResponse.json({
          ...cached,
          isCached: true,
        });
      }
    } catch (cacheError) {
      console.warn("[Upstash Redis] Cache read error (falling back to live fetch):", cacheError);
    }
  }

  // 2. Cache miss or Redis unavailable — fetch analysis
  try {
    const analysis = await analyzeChannel(query);
    const isMockData = analysis.source === "mock";

    const responsePayload: CachedPayload = {
      success: true,
      ok: true,
      isMockData,
      analysis,
      seeds: listSeedChannels(),
      apiConfigured: Boolean(process.env.YOUTUBE_API_KEY),
      ...(isMockData ? { alert: "Sandbox Mode (Mock Data Active)" } : undefined),
    };

    // 3. Save to Redis with 24-hour expiration (86400 seconds) on successful fetch
    if (redis && !isMockData) {
      try {
        await redis.set(normalizedKey, responsePayload, { ex: 86400 });
      } catch (cacheWriteError) {
        console.warn("[Upstash Redis] Cache write error:", cacheWriteError);
      }
    }

    return NextResponse.json({
      ...responsePayload,
      isCached: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        ok: false,
        isMockData: true,
        isCached: false,
        error: error instanceof Error ? error.message : "Analysis failed",
        alert: "Sandbox Mode (Mock Data Active)",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { query?: string; q?: string };
  const rawQuery = body.query ?? body.q ?? "Veritasium";
  const query = rawQuery.trim();
  const normalizedKey = `cache:channel:${query.toLowerCase().replace(/\s+/g, "")}`;

  const redis = getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get<CachedPayload>(normalizedKey);
      if (cached && cached.analysis) {
        return NextResponse.json({
          ...cached,
          isCached: true,
        });
      }
    } catch (cacheError) {
      console.warn("[Upstash Redis] Cache read error:", cacheError);
    }
  }

  const analysis = await analyzeChannel(query);
  const isMockData = analysis.source === "mock";

  const responsePayload: CachedPayload = {
    success: true,
    ok: true,
    isMockData,
    analysis,
    seeds: listSeedChannels(),
    apiConfigured: Boolean(process.env.YOUTUBE_API_KEY),
    ...(isMockData ? { alert: "Sandbox Mode (Mock Data Active)" } : undefined),
  };

  if (redis && !isMockData) {
    try {
      await redis.set(normalizedKey, responsePayload, { ex: 86400 });
    } catch (cacheWriteError) {
      console.warn("[Upstash Redis] Cache write error:", cacheWriteError);
    }
  }

  return NextResponse.json({
    ...responsePayload,
    isCached: false,
  });
}
