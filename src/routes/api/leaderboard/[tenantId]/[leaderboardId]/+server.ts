import { error, json, type RequestHandler } from '@sveltejs/kit';
import { redis } from '$lib/server/redis';
import { creators } from "$lib/server/data/creators";
import { integrations } from '$lib/server/data/integrations';
import { normalizeSiteName } from '$lib/utils';
import type { ILeaderboardEntry } from '$lib/types';

const getRedisKey = (tenantId: string, leaderboardId: string) =>
    `tenant:${tenantId}:leaderboard:${leaderboardId}`;

const fetchLeaderboardData = async (
    apiKey: string,
    integration: typeof integrations[string],
    start: Date,
    end: Date
): Promise<ILeaderboardEntry[]> => {
    const data = await integration.getWagers(apiKey, start, end);
    return integration
        .normalize(data)
        .sort((a, b) => b.totalWagered - a.totalWagered);
};

function anonymizeName(name: string | undefined): string {
    if (!name) return "**unknown**";
    if (name.length <= 3) return `${name}***`;
    return `${name.slice(0, 3)}${"*".repeat(name.length - 3)}`;
}

export const GET: RequestHandler = async ({ params, url }) => {
    try {
        const { tenantId, leaderboardId } = params;
        if (!tenantId || !leaderboardId) throw error(400, 'Missing parameters');

        const tenant = creators[tenantId];
        if (!tenant) throw error(404, 'Tenant not found');

        const integration = integrations[leaderboardId];
        if (!integration) throw error(400, 'Invalid leaderboard integration');

        let websiteDetails;
        for (const board of tenant.websiteLeaderboards) {
            if (normalizeSiteName(board.siteName) === leaderboardId) {
                websiteDetails = board;
                break;
            }
        }
        if (!websiteDetails?.apiKey) throw error(400, 'API key missing');

        const redisBaseKey = getRedisKey(tenantId, leaderboardId);
        const redisEntriesKey = `${redisBaseKey}:entries`;
        const ttlSeconds = 900;

        const redisMeta = await redis.hgetall(redisBaseKey);
        const now = new Date();
        const startMinus20 = new Date(now.getTime() - 20 * 60 * 1000);

        let startingDate = redisMeta?.startingDate
            ? new Date(redisMeta.startingDate)
            : new Date(websiteDetails.duration.startingDate);

        startingDate = startingDate > startMinus20 ? startMinus20 : startingDate;

        let endingDate = redisMeta?.endingDate
            ? new Date(redisMeta.endingDate)
            : new Date(websiteDetails.duration.endingDate);

        const duration = redisMeta?.duration
            ? Number(redisMeta.duration)
            : new Date(websiteDetails.duration.endingDate).getTime() -
            new Date(websiteDetails.duration.startingDate).getTime();

        if (now > endingDate) {
            startingDate = startMinus20;
            endingDate = new Date(startingDate.getTime() + duration);
            await redis.del(redisEntriesKey);
        }

        await redis.hset(redisBaseKey, {
            startingDate: startingDate.toISOString(),
            endingDate: endingDate.toISOString(),
            duration: duration.toString()
        });

        const showPrevious = url.searchParams.get('previous') === 'true';

        // Adjust period for previous leaderboard
        const targetStart = showPrevious
            ? new Date(startingDate.getTime() - duration)
            : startingDate;

        const targetEnd = showPrevious
            ? new Date(startingDate.getTime())
            : endingDate;

        const cacheKey = showPrevious ? `${redisBaseKey}:previous` : redisEntriesKey;

        let leaderboardEntries: ILeaderboardEntry[];
        let cachedUntil: string;

        const cached = await redis.get(cacheKey);
        if (cached) {
            leaderboardEntries = JSON.parse(cached) as ILeaderboardEntry[];
            const ttl = await redis.ttl(cacheKey);
            cachedUntil = new Date(Date.now() + ttl * 1000).toISOString();
        } else {
            leaderboardEntries = await fetchLeaderboardData(
                websiteDetails.apiKey,
                integration,
                targetStart,
                targetEnd
            );
            await redis.set(cacheKey, JSON.stringify(leaderboardEntries), 'EX', ttlSeconds);
            cachedUntil = new Date(Date.now() + ttlSeconds * 1000).toISOString();
        }

        return json({
            tenantId,
            leaderboardId,
           entries: leaderboardEntries.map(entry => {
    const isShock = false;
    const prev = showPrevious;

    return {
        ...entry,
        username: !prev && isShock
            ? "N/A"
            : anonymizeName(entry.username)
    };
}),
            cachedUntil,
            duration: {
                startingDate: targetStart,
                endingDate: targetEnd,
                duration
            }
        });
    } catch (err: any) {
        if (err?.status && err?.body) throw err;
        console.error(err);
        throw error(500, 'Internal Server Error');
    }
};
