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
    wageredDetails: WageredDetails = {}
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
    };
}

export const creators: Record<string, Icreator> = {
    sack: {
        name: "Sack",
        code: "Sack",
        primaryColor: "#5170FF",
        description:
            "I've been creating gambling content online since 2021. Since starting I've set the bar in my niche, for Consistency, legitimacy, and Transparency. I strive to give all users a premium and worthwhile experience no matter the tier their rolling at.",
        socials: [
            createSocial("youtube", "@SackGambles", "https://www.youtube.com/@sackgambles"),
            createSocial("kick", "@SackGambles", "https://kick.com/SackGambles"),
        ],
        websiteLeaderboards: [
            leaderboardConfig(
                "goldpump-com",
                "Sack",
                "2025-12-17T05:00:00.000Z",
                "2026-01-01T05:00:00.000Z",
                "your-goldpump-api-key-here",
                {
                    1: 230_000,
                    2: 145_000,
                    3: 117_500,
                    4: 80_000,
                    5: 50_000,
                    6: 45_000,
                    7: 32_500,
                }, {
                //wagerName: "$",
                shouldShowIcon: true,
            }
            ),
            leaderboardConfig(
                "chicken-gg",
                "Sack",
                "2025-12-19T05:00:00.000Z", "2025-12-26T05:00:00.000Z",
                "d65f7bad17ddf19b16d3124013ae5a44",
           {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,

                },
                {
                    wagerName: "XP",
                    shouldShowIcon: false,
                }
            ),leaderboardConfig(
                "shock-com",
                "Sack",
                "2026-01-06T05:00:00.000Z", "2026-01-13T05:00:00.000Z",
                "6557c117-2429-489e-9078-af4b1b70e70a",
                {
           1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,

                },
                {
                    shouldShowIcon: true,
                }
            ),
        ],
    },
};
