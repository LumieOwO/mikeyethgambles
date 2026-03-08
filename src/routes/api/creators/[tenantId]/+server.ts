import { creator } from "$lib/server/data/creators";
import { type RequestHandler, json } from "@sveltejs/kit";
import { redis } from "$lib/server/redis";
import { adminKeys } from "$lib/server/admin/redis-keys";
import { integrations } from "$lib/server/data/integrations";

const SOCIAL_ICON_MAP: Record<string, string> = {
    youtube: "youtube.svg",
    kick: "kick.svg",
    twitter: "twitter.svg",
    discord: "discord.svg",
    tiktok: "tiktok.svg",
    twitch: "twitch.svg",
};

const SOCIAL_BG_MAP: Record<string, string> = {
    youtube: "bg-[#FF000010]",
    kick: "bg-[#1EA36240]",
    twitter: "bg-[#1EA1F240]",
    discord: "bg-[#7289da30]",
    tiktok: "bg-[#FFFFFF10]",
    twitch: "bg-[#9146FF30]",
};

export const GET: RequestHandler = async () => {
    const sanitizedCreator = {
        ...creator,
        websiteLeaderboards: creator.websiteLeaderboards.map(lb => {
            const { apiKey, ...rest } = lb;
            return rest;
        })
    };

    // Merge admin social overrides
    try {
        const keyType = await redis.type(adminKeys.socials);
        if (keyType === "string") {
            const socialsRaw = await redis.get(adminKeys.socials);
            if (socialsRaw) {
                const socialLinks: { id: string; platform: string; url: string; title: string }[] = JSON.parse(socialsRaw);
                if (socialLinks.length > 0) {
                    sanitizedCreator.socials = socialLinks.map(s => ({
                        cardBackground: SOCIAL_BG_MAP[s.platform] || "",
                        icon: SOCIAL_ICON_MAP[s.platform] || "",
                        title: s.title || `@${creator.name}`,
                        href: s.url,
                    }));
                }
            }
        } else if (keyType === "hash") {
            // Legacy format — migrate: read hash, delete, save as JSON string
            const socialsData = await redis.hgetall(adminKeys.socials);
            const platforms = ["youtube", "kick", "twitter", "discord", "tiktok", "twitch"];
            const socials = [];
            for (const p of platforms) {
                if (socialsData[`${p}_enabled`] === "true" && socialsData[`${p}_url`]) {
                    socials.push({
                        cardBackground: SOCIAL_BG_MAP[p] || "",
                        icon: SOCIAL_ICON_MAP[p] || "",
                        title: socialsData[`${p}_title`] || `@${creator.name}`,
                        href: socialsData[`${p}_url`],
                    });
                }
            }
            if (socials.length > 0) {
                sanitizedCreator.socials = socials;
            }
            // Migrate to new format
            const newFormat = platforms
                .filter(p => socialsData[`${p}_enabled`] === "true" && socialsData[`${p}_url`])
                .map(p => ({
                    id: crypto.randomUUID(),
                    platform: p,
                    url: socialsData[`${p}_url`],
                    title: socialsData[`${p}_title`] || "",
                }));
            await redis.del(adminKeys.socials);
            if (newFormat.length > 0) {
                await redis.set(adminKeys.socials, JSON.stringify(newFormat));
            }
        }
    } catch { /* ignore socials errors */ }

    // Merge admin appearance overrides
    const appearance = await redis.hgetall(adminKeys.appearance);
    if (appearance.logoUrl) {
        (sanitizedCreator as any).logoUrl = appearance.logoUrl;
    }
    if (appearance.primaryColor) {
        sanitizedCreator.primaryColor = appearance.primaryColor;
    }

    // Merge admin bonuses
    const bonusIds = await redis.smembers(adminKeys.bonusesSet);
    const bonuses = [];
    for (const id of bonusIds) {
        const d = await redis.hgetall(adminKeys.bonus(id));
        if (d.casino) {
            bonuses.push({
                id,
                casino: d.casino,
                code: d.code || "",
                href: d.href || "",
                mainBonus: d.mainBonus || "",
                extraBonus: d.extraBonus || "",
                logoUrl: d.logoUrl || "",
                color: d.color || "#ffffff",
            });
        }
    }
    (sanitizedCreator as any).bonuses = bonuses;

    // Merge admin-created leaderboards
    const adminLbIds = await redis.smembers(adminKeys.leaderboardsSet);
    for (const lbId of adminLbIds) {
        const d = await redis.hgetall(adminKeys.leaderboard(lbId));
        if (!d.site || !integrations[d.site]) continue;

        let prizes: Record<number, number> = {};
        try { prizes = JSON.parse(d.prizes || "{}"); } catch { /* empty */ }

        sanitizedCreator.websiteLeaderboards.push({
            primaryColor: d.primaryColor || "#ffffff",
            href: d.href || "",
            siteName: d.siteName || lbId,
            prizes,
            highlightedWord: d.highlightedWord || "",
            duration: {
                startingDate: new Date(d.startDate),
                endingDate: new Date(d.endDate),
            },
        });
    }

    return json(sanitizedCreator);
};
