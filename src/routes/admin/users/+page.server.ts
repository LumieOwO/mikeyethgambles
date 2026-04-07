import type { PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { creator } from "$lib/server/data/creators";
import { integrations } from "$lib/server/data/integrations";
import { normalizeSiteName } from "$lib/utils";
import { adminKeys } from "$lib/server/admin/redis-keys";
import type { ILeaderboardEntry } from "$lib/types";

interface UserRow {
    username: string;
    avatar: string;
    totalWagered: number;
    totalWageredUsd: number;
    siteName: string;
    leaderboardId: string;
}

interface SiteStats {
    siteName: string;
    userCount: number;
    totalWagered: number;
    totalWageredUsd: number;
}

// Currency-to-USD conversion rates for sites that don't use USD natively.
// Key = normalized site ID. Value = how many USD per 1 unit of site currency.
const USD_RATES: Record<string, number> = {
    "goldpump-com": 2.1 / 1000, // 1,000 GoldPump currency = $2.10
    "harvester-gg": 1 / 1.45,   // 1.45 coins = $1
};

export const load: PageServerLoad = async () => {
    const users: UserRow[] = [];

    // Fetch from hardcoded leaderboards
    for (const lb of creator.websiteLeaderboards) {
        const lbId = normalizeSiteName(lb.siteName);
        const cacheKey = `tenant:mikey:leaderboard:${lbId}:entries`;
        const cached = await redis.get(cacheKey);

        let entries: ILeaderboardEntry[] = [];

        if (cached) {
            entries = JSON.parse(cached);
        } else if (lb.apiKey) {
            const integration = integrations[lbId];
            if (integration) {
                try {
                    const now = new Date();
                    const start = new Date(lb.duration.startingDate);
                    const end = new Date(lb.duration.endingDate);
                    const data = await integration.getWagers(lb.apiKey, start > now ? new Date(now.getTime() - 7 * 86400000) : start, end < now ? now : end);
                    entries = integration.normalize(data);
                } catch (e) {
                    console.error(`Failed to fetch ${lbId}:`, e);
                }
            }
        }

        const rate = USD_RATES[lbId] ?? 1;
        for (const entry of entries) {
            users.push({
                username: entry.username,
                avatar: entry.avatar,
                totalWagered: entry.totalWagered,
                totalWageredUsd: entry.totalWagered * rate,
                siteName: lb.siteName,
                leaderboardId: lbId,
            });
        }
    }

    // Also fetch from admin-created leaderboards
    const adminLbIds = await redis.smembers(adminKeys.leaderboardsSet);
    for (const lbId of adminLbIds) {
        const lbData = await redis.hgetall(adminKeys.leaderboard(lbId));
        if (!lbData.site) continue;

        const cacheKey = `tenant:mikey:leaderboard:${lbId}:entries`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            const rate = USD_RATES[lbId] ?? 1;
            const entries: ILeaderboardEntry[] = JSON.parse(cached);
            for (const entry of entries) {
                users.push({
                    username: entry.username,
                    avatar: entry.avatar,
                    totalWagered: entry.totalWagered,
                    totalWageredUsd: entry.totalWagered * rate,
                    siteName: lbData.siteName || lbId,
                    leaderboardId: lbId,
                });
            }
        }
    }

    // Sort by USD wager desc
    users.sort((a, b) => b.totalWageredUsd - a.totalWageredUsd);

    // Build per-site stats
    const siteMap = new Map<string, SiteStats>();
    for (const u of users) {
        const existing = siteMap.get(u.siteName);
        if (existing) {
            existing.userCount++;
            existing.totalWagered += u.totalWagered;
            existing.totalWageredUsd += u.totalWageredUsd;
        } else {
            siteMap.set(u.siteName, { siteName: u.siteName, userCount: 1, totalWagered: u.totalWagered, totalWageredUsd: u.totalWageredUsd });
        }
    }
    const siteStats = Array.from(siteMap.values()).sort((a, b) => b.totalWageredUsd - a.totalWageredUsd);

    // Aggregate stats (all in USD)
    const totalWagered = users.reduce((sum, u) => sum + u.totalWageredUsd, 0);
    const avgWagered = users.length > 0 ? totalWagered / users.length : 0;
    const topWagered = users.length > 0 ? users[0].totalWageredUsd : 0;

    return { users, siteStats, totalWagered, avgWagered, topWagered };
};
