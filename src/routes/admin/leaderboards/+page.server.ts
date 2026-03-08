import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { creator } from "$lib/server/data/creators";
import { integrations } from "$lib/server/data/integrations";
import { normalizeSiteName } from "$lib/utils";
import { adminKeys } from "$lib/server/admin/redis-keys";
import type { ILeaderboardEntry } from "$lib/types";

interface LeaderboardRow {
    id: string;
    siteName: string;
    site: string; // integration key
    startDate: string;
    endDate: string;
    totalPrizePool: number;
    prizes: Record<number, number>;
    status: "active" | "ended" | "completed";
    source: "config" | "admin";
    apiKey?: string;
    code?: string;
    wagerName?: string;
    shouldShowIcon?: boolean;
    winnersExist: boolean;
}

function getStatus(startDate: string, endDate: string, hasWinners: boolean): "active" | "ended" | "completed" {
    if (hasWinners) return "completed";
    const now = new Date();
    const end = new Date(endDate);
    return now > end ? "ended" : "active";
}

export const load: PageServerLoad = async () => {
    const leaderboards: LeaderboardRow[] = [];

    // Hardcoded leaderboards
    for (const lb of creator.websiteLeaderboards) {
        const lbId = normalizeSiteName(lb.siteName);
        const winnersKey = adminKeys.winners(lbId);
        const hasWinners = await redis.exists(winnersKey) === 1;

        const prizes = (lb.prizes || {}) as Record<number, number>;
        const total = Object.values(prizes).reduce((s, v) => s + v, 0);

        leaderboards.push({
            id: lbId,
            siteName: lb.siteName,
            site: lbId,
            startDate: lb.duration.startingDate.toISOString(),
            endDate: lb.duration.endingDate.toISOString(),
            totalPrizePool: total,
            prizes,
            status: getStatus(lb.duration.startingDate.toISOString(), lb.duration.endingDate.toISOString(), hasWinners),
            source: "config",
            apiKey: lb.apiKey,
            code: creator.code,
            winnersExist: hasWinners,
        });
    }

    // Admin-created leaderboards
    const adminLbIds = await redis.smembers(adminKeys.leaderboardsSet);
    for (const lbId of adminLbIds) {
        const d = await redis.hgetall(adminKeys.leaderboard(lbId));
        if (!d.site) continue;

        const winnersKey = adminKeys.winners(lbId);
        const hasWinners = await redis.exists(winnersKey) === 1;

        let prizes: Record<number, number> = {};
        try { prizes = JSON.parse(d.prizes || "{}"); } catch { /* empty */ }
        const total = Object.values(prizes).reduce((s: number, v: number) => s + v, 0);

        leaderboards.push({
            id: lbId,
            siteName: d.siteName || lbId,
            site: d.site,
            startDate: d.startDate || "",
            endDate: d.endDate || "",
            totalPrizePool: total,
            prizes,
            status: getStatus(d.startDate || "", d.endDate || "", hasWinners),
            source: "admin",
            apiKey: d.apiKey,
            code: d.code || creator.code,
            wagerName: d.wagerName,
            shouldShowIcon: d.shouldShowIcon === "true",
            winnersExist: hasWinners,
        });
    }

    const availableSites = Object.keys(integrations);

    return { leaderboards, availableSites };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const form = await request.formData();
        const site = form.get("site") as string;
        const code = form.get("code") as string || creator.code;
        const startDate = form.get("startDate") as string;
        const endDate = form.get("endDate") as string;
        const apiKey = form.get("apiKey") as string;
        const wagerName = form.get("wagerName") as string || "Wagered";
        const shouldShowIcon = form.get("shouldShowIcon") === "on" ? "true" : "false";

        if (!site || !startDate || !endDate || !apiKey) {
            return fail(400, { error: "All fields are required" });
        }

        if (!integrations[site]) {
            return fail(400, { error: "Invalid site integration" });
        }

        // Parse prizes
        const prizes: Record<number, number> = {};
        for (let i = 1; i <= 10; i++) {
            const val = form.get(`prize_${i}`);
            if (val && Number(val) > 0) {
                prizes[i] = Number(val);
            }
        }

        const integration = integrations[site];
        const details = integration.frontendDetails(code);

        const lbId = `${site}-${Date.now()}`;

        await redis.hset(adminKeys.leaderboard(lbId), {
            site,
            siteName: details.siteName,
            code,
            startDate,
            endDate,
            apiKey,
            prizes: JSON.stringify(prizes),
            wagerName,
            shouldShowIcon,
            highlightedWord: details.highlightedWord,
            primaryColor: details.primaryColor,
            href: details.href,
        });

        await redis.sadd(adminKeys.leaderboardsSet, lbId);

        // Also create the runtime leaderboard keys
        const runtimeKey = adminKeys.runtimeLeaderboard(lbId);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = end.getTime() - start.getTime();

        await redis.hset(runtimeKey, {
            startingDate: start.toISOString(),
            endingDate: end.toISOString(),
            duration: duration.toString(),
        });
        await redis.sadd(adminKeys.runtimeLeaderboardsSet, lbId);

        return { success: true, created: lbId };
    },

    delete: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        if (!id) return fail(400, { error: "Missing leaderboard ID" });

        await redis.del(adminKeys.leaderboard(id));
        await redis.del(adminKeys.winners(id));
        await redis.del(adminKeys.runtimeLeaderboard(id));
        await redis.del(adminKeys.runtimeLeaderboardEntries(id));
        await redis.srem(adminKeys.leaderboardsSet, id);
        await redis.srem(adminKeys.runtimeLeaderboardsSet, id);

        return { success: true, deleted: id };
    },

    snapshot: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        if (!id) return fail(400, { error: "Missing leaderboard ID" });

        // Try to get entries from cache
        const cacheKey = adminKeys.runtimeLeaderboardEntries(id);
        let entries: ILeaderboardEntry[] = [];

        const cached = await redis.get(cacheKey);
        if (cached) {
            entries = JSON.parse(cached);
        } else {
            // Try fetching from integration
            const adminLb = await redis.hgetall(adminKeys.leaderboard(id));

            if (adminLb.site && adminLb.apiKey) {
                const integration = integrations[adminLb.site];
                if (integration) {
                    try {
                        const start = new Date(adminLb.startDate);
                        const end = new Date(adminLb.endDate);
                        const data = await integration.getWagers(adminLb.apiKey, start, end);
                        entries = integration.normalize(data).sort((a, b) => b.totalWagered - a.totalWagered);
                    } catch (e) {
                        console.error(`Snapshot fetch failed for ${id}:`, e);
                    }
                }
            } else {
                // It's a config leaderboard, look for it
                for (const lb of creator.websiteLeaderboards) {
                    if (normalizeSiteName(lb.siteName) === id && lb.apiKey) {
                        const integration = integrations[normalizeSiteName(lb.siteName)];
                        if (integration) {
                            try {
                                const data = await integration.getWagers(lb.apiKey, lb.duration.startingDate, lb.duration.endingDate);
                                entries = integration.normalize(data).sort((a, b) => b.totalWagered - a.totalWagered);
                            } catch (e) {
                                console.error(`Snapshot fetch failed for ${id}:`, e);
                            }
                        }
                        break;
                    }
                }
            }
        }

        if (entries.length === 0) {
            return fail(400, { error: "No entries found to snapshot" });
        }

        await redis.set(adminKeys.winners(id), JSON.stringify(entries));

        return { success: true, snapshotted: id, count: entries.length };
    },
};
