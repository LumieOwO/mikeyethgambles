import { error, json, type RequestHandler } from '@sveltejs/kit';
import { redis } from '$lib/server/redis';
import { creator } from "$lib/server/data/creators";
import { integrations } from '$lib/server/data/integrations';
import { normalizeSiteName } from '$lib/utils';
import type { ILeaderboardEntry } from '$lib/types';
import { adminKeys } from '$lib/server/admin/redis-keys';

const TENANT_ID = "mikey";

const getRedisKey = (leaderboardId: string) =>
    `tenant:${TENANT_ID}:leaderboard:${leaderboardId}`;

interface FetchResult {
    entries: ILeaderboardEntry[];
    meta?: { startDate: Date; endDate: Date; prizes: Record<number, number> } | null;
}

const fetchLeaderboardData = async (
    apiKey: string,
    integration: typeof integrations[string],
    start: Date,
    end: Date
): Promise<FetchResult> => {
    const data = await integration.getWagers(apiKey, start, end);
    const entries = integration
        .normalize(data)
        .sort((a, b) => b.totalWagered - a.totalWagered);
    const meta = integration.getMeta?.(data) ?? null;
    return { entries, meta };
};

function anonymizeName(name: string | undefined): string {
    if (!name) return "**unknown**";
    if (name.length <= 3) return `${name}***`;
    return `${name.slice(0, 3)}${"*".repeat(name.length - 3)}`;
}

export const GET: RequestHandler = async ({ params, url }) => {
    try {
        const { leaderboardId } = params;
        if (!leaderboardId) throw error(400, 'Missing parameters');

        // Find integration - check if it's a known integration key
        let integrationKey = leaderboardId;
        let integration = integrations[integrationKey];

        // For admin-created leaderboards, the ID might be like "shock-com-1234567"
        // so we need to look up the site from Redis
        let websiteApiKey: string | undefined;
        let websiteStartDate: Date | undefined;
        let websiteEndDate: Date | undefined;

        // Check config leaderboards first
        let foundInConfig = false;
        for (const board of creator.websiteLeaderboards) {
            if (normalizeSiteName(board.siteName) === leaderboardId) {
                websiteApiKey = board.apiKey;
                websiteStartDate = board.duration.startingDate;
                websiteEndDate = board.duration.endingDate;
                foundInConfig = true;
                break;
            }
        }

        // If not in config, check admin-created leaderboards
        if (!foundInConfig) {
            // Try exact ID match first
            let adminLb = await redis.hgetall(adminKeys.leaderboard(leaderboardId));

            // If not found, scan admin leaderboards by site key
            // (admin IDs are like "goldpump-com-1234567" but URL uses "goldpump-com")
            if (!adminLb.site) {
                const adminLbIds = await redis.smembers(adminKeys.leaderboardsSet);
                for (const id of adminLbIds) {
                    const d = await redis.hgetall(adminKeys.leaderboard(id));
                    if (d.site === leaderboardId) {
                        adminLb = d;
                        break;
                    }
                }
            }

            if (adminLb.site && adminLb.apiKey) {
                integrationKey = adminLb.site;
                integration = integrations[integrationKey];
                websiteApiKey = adminLb.apiKey;
                websiteStartDate = new Date(adminLb.startDate);
                websiteEndDate = new Date(adminLb.endDate);
            }
        }

        if (!integration) throw error(400, 'Invalid leaderboard integration');
        if (!websiteApiKey) throw error(400, 'API key missing');

        const redisBaseKey = getRedisKey(leaderboardId);
        const redisEntriesKey = `${redisBaseKey}:entries`;
        const ttlSeconds = 900;

        const redisMeta = await redis.hgetall(redisBaseKey);
        const now = new Date();
        const startMinus20 = new Date(now.getTime() - 20 * 60 * 1000);

        let startingDate = redisMeta?.startingDate
            ? new Date(redisMeta.startingDate)
            : new Date(websiteStartDate!);

        startingDate = startingDate > startMinus20 ? startMinus20 : startingDate;

        let endingDate = redisMeta?.endingDate
            ? new Date(redisMeta.endingDate)
            : new Date(websiteEndDate!);

        const duration = redisMeta?.duration
            ? Number(redisMeta.duration)
            : websiteEndDate!.getTime() - websiteStartDate!.getTime();

        if (now > endingDate) {
            // Snapshot winners before restarting
            try {
                // Try cache first, otherwise fetch fresh
                const cached = await redis.get(redisEntriesKey);
                let finalEntries: ILeaderboardEntry[];
                if (cached) {
                    finalEntries = JSON.parse(cached) as ILeaderboardEntry[];
                } else {
                    const result = await fetchLeaderboardData(
                        websiteApiKey,
                        integration,
                        startingDate,
                        endingDate
                    );
                    finalEntries = result.entries;
                }

                if (finalEntries.length > 0) {
                    const snapshot = {
                        entries: finalEntries.map(e => ({
                            ...e,
                            username: anonymizeName(e.username)
                        })),
                        startingDate: startingDate.toISOString(),
                        endingDate: endingDate.toISOString(),
                        snapshotAt: now.toISOString()
                    };
                    await redis.set(
                        adminKeys.winners(leaderboardId),
                        JSON.stringify(snapshot)
                    );
                }
            } catch (snapshotErr) {
                console.error('Failed to snapshot winners:', snapshotErr);
            }

            while (endingDate <= now) {
                startingDate = endingDate;
                endingDate = new Date(startingDate.getTime() + duration);
            }
            await redis.del(redisEntriesKey);
        }

        await redis.hset(redisBaseKey, {
            startingDate: startingDate.toISOString(),
            endingDate: endingDate.toISOString(),
            duration: duration.toString()
        });

        const showPrevious = url.searchParams.get('previous') === 'true';

        const targetStart = showPrevious
            ? new Date(startingDate.getTime() - duration)
            : startingDate;

        const targetEnd = showPrevious
            ? new Date(startingDate.getTime())
            : endingDate;

        const cacheKey = showPrevious ? `${redisBaseKey}:previous` : redisEntriesKey;

        let leaderboardEntries: ILeaderboardEntry[];
        let cachedUntil: string;
        let apiPrizes: Record<number, number> | undefined;

        const cached = await redis.get(cacheKey);
        const cachedPrizes = await redis.get(`${redisBaseKey}:prizes`);
        if (cachedPrizes) {
            apiPrizes = JSON.parse(cachedPrizes);
        }
        if (cached) {
            leaderboardEntries = JSON.parse(cached) as ILeaderboardEntry[];
            const ttl = await redis.ttl(cacheKey);
            cachedUntil = new Date(Date.now() + ttl * 1000).toISOString();
        } else {
            const result = await fetchLeaderboardData(
                websiteApiKey,
                integration,
                targetStart,
                targetEnd
            );
            leaderboardEntries = result.entries;

            // Use API-provided dates/prizes when available (e.g. CSGOWIN)
            if (result.meta) {
                if (!showPrevious) {
                    startingDate = result.meta.startDate;
                    endingDate = result.meta.endDate;

                    // Persist API-provided dates back to Redis
                    await redis.hset(redisBaseKey, {
                        startingDate: startingDate.toISOString(),
                        endingDate: endingDate.toISOString(),
                    });
                }
                apiPrizes = result.meta.prizes;
                await redis.set(`${redisBaseKey}:prizes`, JSON.stringify(apiPrizes), 'EX', ttlSeconds);
            }

            await redis.set(cacheKey, JSON.stringify(leaderboardEntries), 'EX', ttlSeconds);
            cachedUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();
        }

        return json({
            tenantId: TENANT_ID,
            leaderboardId,
            entries: leaderboardEntries.map(entry => ({
                ...entry,
                username: anonymizeName(entry.username)
            })),
            cachedUntil,
            ...(apiPrizes ? { prizes: apiPrizes } : {}),
            duration: {
                startingDate: showPrevious ? targetStart : startingDate,
                endingDate: showPrevious ? targetEnd : endingDate,
                duration
            }
        });
    } catch (err: any) {
        if (err?.status && err?.body) throw err;
        console.error(err);
        throw error(500, 'Internal Server Error');
    }
};
