import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { creator } from "$lib/server/data/creators";
import { integrations } from "$lib/server/data/integrations";
import { normalizeSiteName } from "$lib/utils";
import { adminKeys } from "$lib/server/admin/redis-keys";
import type { ILeaderboardEntry } from "$lib/types";

export const load: PageServerLoad = async ({ params }) => {
    const { id } = params;

    // Check admin-created leaderboards first
    const adminData = await redis.hgetall(adminKeys.leaderboard(id));

    let leaderboard: {
        id: string;
        siteName: string;
        site: string;
        startDate: string;
        endDate: string;
        apiKey: string;
        code: string;
        prizes: Record<number, number>;
        wagerName: string;
        shouldShowIcon: boolean;
        source: "config" | "admin";
    };

    if (adminData.site) {
        let prizes: Record<number, number> = {};
        try { prizes = JSON.parse(adminData.prizes || "{}"); } catch { /* empty */ }

        leaderboard = {
            id,
            siteName: adminData.siteName || id,
            site: adminData.site,
            startDate: adminData.startDate || "",
            endDate: adminData.endDate || "",
            apiKey: adminData.apiKey || "",
            code: adminData.code || creator.code,
            prizes,
            wagerName: adminData.wagerName || "Wagered",
            shouldShowIcon: adminData.shouldShowIcon === "true",
            source: "admin",
        };
    } else {
        // Check config leaderboards
        const configLb = creator.websiteLeaderboards.find(
            (lb) => normalizeSiteName(lb.siteName) === id
        );

        if (!configLb) throw error(404, "Leaderboard not found");

        leaderboard = {
            id,
            siteName: configLb.siteName,
            site: normalizeSiteName(configLb.siteName),
            startDate: configLb.duration.startingDate.toISOString(),
            endDate: configLb.duration.endingDate.toISOString(),
            apiKey: configLb.apiKey || "",
            code: creator.code,
            prizes: (configLb.prizes || {}) as Record<number, number>,
            wagerName: (configLb as any).wageredDetails?.wagerName || "Wagered",
            shouldShowIcon: (configLb as any).wageredDetails?.shouldShowIcon ?? true,
            source: "config",
        };
    }

    // Load winners snapshot
    const winnersJson = await redis.get(adminKeys.winners(id));
    let winners: ILeaderboardEntry[] = [];
    if (winnersJson) {
        winners = JSON.parse(winnersJson);
    }

    const availableSites = Object.keys(integrations);

    return { leaderboard, winners, availableSites };
};

export const actions: Actions = {
    update: async ({ request, params }) => {
        const { id } = params;
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

        const prizes: Record<number, number> = {};
        for (let i = 1; i <= 10; i++) {
            const val = form.get(`prize_${i}`);
            if (val && Number(val) > 0) {
                prizes[i] = Number(val);
            }
        }

        const integration = integrations[site];
        if (!integration) return fail(400, { error: "Invalid site integration" });

        const details = integration.frontendDetails(code);

        await redis.hset(adminKeys.leaderboard(id), {
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

        // Update runtime keys
        const runtimeKey = adminKeys.runtimeLeaderboard(id);
        const start = new Date(startDate);
        const end = new Date(endDate);
        await redis.hset(runtimeKey, {
            startingDate: start.toISOString(),
            endingDate: end.toISOString(),
            duration: (end.getTime() - start.getTime()).toString(),
        });

        // Clear cached entries so new settings take effect
        await redis.del(adminKeys.runtimeLeaderboardEntries(id));

        return { success: true };
    },

    snapshot: async ({ params }) => {
        const { id } = params;

        const cacheKey = adminKeys.runtimeLeaderboardEntries(id);
        let entries: ILeaderboardEntry[] = [];

        const cached = await redis.get(cacheKey);
        if (cached) {
            entries = JSON.parse(cached);
        } else {
            const adminLb = await redis.hgetall(adminKeys.leaderboard(id));

            if (adminLb.site && adminLb.apiKey) {
                const integration = integrations[adminLb.site];
                if (integration) {
                    try {
                        const data = await integration.getWagers(adminLb.apiKey, new Date(adminLb.startDate), new Date(adminLb.endDate));
                        entries = integration.normalize(data).sort((a, b) => b.totalWagered - a.totalWagered);
                    } catch (e) {
                        console.error(`Snapshot fetch failed:`, e);
                    }
                }
            } else {
                const configLb = creator.websiteLeaderboards.find(
                    (lb) => normalizeSiteName(lb.siteName) === id
                );
                if (configLb?.apiKey) {
                    const integration = integrations[normalizeSiteName(configLb.siteName)];
                    if (integration) {
                        try {
                            const data = await integration.getWagers(configLb.apiKey, configLb.duration.startingDate, configLb.duration.endingDate);
                            entries = integration.normalize(data).sort((a, b) => b.totalWagered - a.totalWagered);
                        } catch (e) {
                            console.error(`Snapshot fetch failed:`, e);
                        }
                    }
                }
            }
        }

        if (entries.length === 0) {
            return fail(400, { error: "No entries found to snapshot" });
        }

        await redis.set(adminKeys.winners(id), JSON.stringify(entries));
        return { success: true, snapshotCount: entries.length };
    },
};
