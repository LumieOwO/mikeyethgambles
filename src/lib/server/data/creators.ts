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
    name: "Clyde",
    code: "Clyde",

    // --- Your brand color (hex) ---
    primaryColor: "#5170FF",

    // --- Your bio / description ---
    description:
        "Exclusive Rewards, Giveaways & Leaderboards",

    // --- Your social links (add/remove as needed) ---
    socials: [
        
        // createSocial("twitter", "@ClydeGambles", "https://twitter.com/ClydeGambles"),
        // createSocial("discord", "ClydeGambles", "https://discord.gg/your-invite"),
    ],

    // --- Your leaderboards (add/remove/edit as needed) ---
    // Each leaderboardConfig call: (site, code, startDate, endDate, apiKey, prizes, wageredDetails)
    websiteLeaderboards: [
        /*         leaderboardConfig(
                    "goldpump-com",
                    "Clyde",
                    "2025-12-17T05:00:00.000Z",         // <-- start date
                    "2026-01-01T05:00:00.000Z",          // <-- end date
                    "your-goldpump-api-key-here",         // <-- API key
                    {                                     // <-- prizes per place (set to null for no prizes)
                        1: 230_000,
                        2: 145_000,
                        3: 117_500,
                        4: 80_000,
                        5: 50_000,
                        6: 45_000,
                        7: 32_500,
                    },
                    {
                        shouldShowIcon: true,
                    },
                    ["100% AFFILIATE KICKBACK", "15% DEPOSIT BONUS"]
                ), */

    ],
};
