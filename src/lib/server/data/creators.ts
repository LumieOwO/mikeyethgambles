import type { Icreator } from "$lib/types";
import { integrations } from "./integrations";

const SOCIAL_STYLES = {
    twitter: { cardBackground: "bg-[#1EA1F240]", icon: "twitter.svg" },
    kick: { cardBackground: "bg-[#1EA36240]", icon: "kick.svg" },
    discord: { cardBackground: "bg-[#7289da30]", icon: "discord.svg" },
    youtube: { cardBackground: "bg-[#FF000010]", icon: "youtube.svg" },
};

function createSocial<T extends keyof typeof SOCIAL_STYLES>(
    platform: T,
    title: string,
    href: string
) {
    return { ...SOCIAL_STYLES[platform], title, href };
}

type WageredDetails = {
    wagerName?: string;
    shouldShowIcon?: boolean;
};

function leaderboardConfig(
    site: keyof typeof integrations,
    code: string,
    start: string,
    end: string,
    apiKey: string,
    prizes: Record<number, number> | null,
    wageredDetails: WageredDetails = {},
    rewardLines: string[] = []
) {
    return {
        ...integrations[site].frontendDetails(code),
        prizes,
        duration: {
            startingDate: new Date(start),
            endingDate: new Date(end),
        },
        apiKey,
        wageredDetails: {
            wagerName: "Wagered",
            shouldShowIcon: true,
            ...wageredDetails,
        },
        rewardLines,
    };
}

// ============================================================
// CLYDE'S CONFIG — Edit everything below to customize your site
// ============================================================

export const creator: Icreator = {
    // --- Your name and referral code ---
    name: "Mikey",
    code: "Mikey",

    // --- Your brand color (hex) ---
    primaryColor: "#5170FF",

    // --- Your bio / description ---
    description:
        "Exclusive Rewards, Giveaways & Leaderboards",

    // --- Your social links (add/remove as needed) ---
    socials: [],

    // --- Your leaderboards (add/remove/edit as needed) ---
    // Each leaderboardConfig call: (site, code, startDate, endDate, apiKey, prizes, wageredDetails)
    websiteLeaderboards: [
        leaderboardConfig(
            "harvester-gg",
            "Mikey",
            "2026-04-05T00:00:00.000Z",
            "2026-04-12T00:00:00.000Z",
            "f02144d6debbdb6ba227b76dc25ce1107b7ce473b90962ff64e36600f7cdc88d",
            {
                1: 140,
                2: 90,
                3: 60,
                4: 40,
                5: 30,
                6: 20,
                7: 10,
                8: 10,
            },
            { shouldShowIcon: true, wagerName: "Wagered" },
        ),
    ],
};
