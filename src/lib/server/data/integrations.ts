import { read } from "$app/server";
import type { ILeaderboardEntry } from "$lib/types";
import goldpumpData from "$lib/goldpump.json" assert { type: "json" };


export interface IIntegrationApi {
    getWagers: (apiKey: string, startingDate: Date, endTime: Date) => Promise<any>;
    normalize: (data: any) => ILeaderboardEntry[];
    frontendDetails: (code: string) => {
        primaryColor: string,
        href: string,
        siteName: string,
        highlightedWord: string
    };
    getMeta?: (data: any) => { startDate: Date; endDate: Date; prizes: Record<number, number> } | null;
}

export const integrations: Record<string, IIntegrationApi> = {
    "shock-com": {
        frontendDetails: (code: string) => {
            return {
                primaryColor: "#0559F3",
                href: `https://shock.com/?r=${code}`,
                siteName: "Shock.com",
                highlightedWord: "Shock"
            };
        },
        getWagers: async (apiKey, startingDate, endTime) => {
            try {
                const body = {
                    apiKey,
                    minDate: startingDate.getTime(),
                    maxDate: endTime.getTime()
                };
                console.log(JSON.stringify(body))
                const res = await fetch("https://shock.com/api/v1/get-referrals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch Shock data: ${res.status} ${res.statusText} - ${text}`);
                }

                return res.json();
            } catch (err: any) {
                console.error("Shock Fetch error:", err);
                throw err;
            }
        },
        normalize: (data: any) => {

            return data.map((user: any, idx: number) => ({
                id: idx, // no id in payload, fallback to index
                username: user.username || "",
                avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`,
                totalWagered: Number(user.wagerAmount) || 0
            }));
        }
    },
    "goldpump-com": {
        frontendDetails: (code: string) => {
            return {
                primaryColor: "#FFBB38",
                href: `https://goldpump.com/r/${code}`,
                siteName: "GoldPump.com",
                highlightedWord: "GoldPump"
            };
        },
        getWagers: async () => goldpumpData,
        normalize: (data: any) => {
            if (!Array.isArray(data)) return [];
            return data.map((entry: any, idx: number) => ({
                id: idx,
                username: entry.username || `User${idx + 1}`,
                avatar: entry.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${entry.username || idx}`,
                totalWagered: Number(entry.totalWagered) || 0
            }));
        }
    },
    "chicken-gg": {
        frontendDetails: (code: string) => {
            return {
                primaryColor: "#1D4583",
                href: `https://chicken.gg/r/${code}`,
                siteName: "Chicken.gg",
                highlightedWord: "GG"
            };
        },
        getWagers: async (apiKey, startingDate, endTime) => {
            try {
                const min = startingDate.getTime();
                const max = endTime.getTime();
                console.log(startingDate, endTime)
                const url = `https://affiliates.chicken.gg/v1/referrals?key=${apiKey}&minTime=${min}&maxTime=${max}`;

                const res = await fetch(url);

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch Chicken data: ${res.status} ${res.statusText} - ${text}`);
                }
                return res.json();
            } catch (err: any) {
                console.error("Chicken Fetch error:", err);
                throw err;
            }
        },
        normalize: (data: any) => {
            return data.referrals.map((user: any, idx: number) => ({
                id: user.userId, // no id in payload, fallback to index
                username: user.displayName || "",
                avatar: user.imageUrl,
                totalWagered: Number(user.xpEarned) || 0
            }));

        }
    },
    "harvester-gg": {
        frontendDetails: (code: string) => ({
            primaryColor: "#4ade80",
            href: `https://harvester.gg`,
            siteName: "Harvester.gg",
            highlightedWord: "Harvester"
        }),
        getWagers: async (apiKey, startingDate, endTime) => {
            const allUsers: any[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const body = {
                    secretKey: apiKey,
                    pagination: { limit: 50, page },
                    timestamps: {
                        start: Math.floor(startingDate.getTime() / 1000),
                        end: Math.floor(endTime.getTime() / 1000)
                    }
                };
                console.log(body)
                const res = await fetch("https://api.harvester.gg/api/v1/affiliates/secret-key", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch Harvester data: ${res.status} ${res.statusText} - ${text}`);
                }

                const data = await res.json();
                allUsers.push(...(data.data?.users ?? []));
                hasNextPage = data.data?.pagination?.hasNextPage ?? false;
                page++;
            }

            return allUsers;
        },
        normalize: (data: any) => {
            if (!Array.isArray(data)) return [];
            return data.map((user: any, idx: number) => ({
                id: user.username || String(idx),
                username: user.username || `User${idx + 1}`,
                avatar: user.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username || idx}`,
                totalWagered: Number(user.wagered) || 0
            }));
        }
    },
    "clash-gg": {
        frontendDetails: (code: string) => ({
            primaryColor: "#FFC83D",
            href: `https://clash.gg/r/${code}`,
            siteName: "Clash.gg",
            highlightedWord: "Clash"
        }),
        getWagers: async (apiKey, startingDate) => {
            const since = startingDate.toISOString().slice(0, 10);
            const url = `https://api.clash.gg/affiliates/leaderboards/my-leaderboards-api?date=${since}`;
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    Cookie: "let-me-in=top-secret-cookie-do-not-share"
                }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to fetch Clash data: ${res.status} ${res.statusText} - ${text}`);
            }
            const json = await res.json();
            const boards: any[] = json?.data ?? [];
            return boards.find(b => b.status === "LIVE") ?? boards[0] ?? null;
        },
        normalize: (data: any) => {
            if (!data?.topPlayers) return [];
            return data.topPlayers.map((user: any, idx: number) => {
                const avatar = user.avatar?.startsWith("/")
                    ? `https://clash.gg${user.avatar}`
                    : user.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name || idx}`;
                return {
                    id: String(user.userId ?? idx),
                    username: user.name || `User${idx + 1}`,
                    avatar,
                    totalWagered: (Number(user.wagered) || 0) / 100
                };
            });
        },
        getMeta: (data: any) => {
            if (!data) return null;
            const startDate = new Date(data.startDate);
            const endDate = new Date(startDate.getTime() + Number(data.durationDays || 0) * 86400000);
            const prizes: Record<number, number> = {};
            if (Array.isArray(data.rewards)) {
                data.rewards.forEach((r: any, idx: number) => {
                    prizes[idx + 1] = Number(r.amount) / 100;
                });
            }
            return { startDate, endDate, prizes };
        }
    },
    "csgowin-com": {
        frontendDetails: (code: string) => ({
            primaryColor: "#f59e0b",
            href: `https://csgowin.com/r/${code}`,
            siteName: "CSGOWIN.com",
            highlightedWord: "CSGOWIN"
        }),
        getWagers: async (apiKey) => {
            const [code, key] = apiKey.split(':');
            const res = await fetch(`https://api.csgowin.com/api/leaderboard/${code}`, {
                headers: { 'x-apikey': key }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed to fetch CSGOWIN data: ${res.status} ${res.statusText} - ${text}`);
            }
            const data = await res.json();
            return data.leaderboards?.[0] ?? null;
        },
        normalize: (data: any) => {
            if (!data?.users) return [];
            return data.users
                .filter((u: any) => !u.hidden)
                .map((user: any, idx: number) => ({
                    id: user.uuid || String(idx),
                    username: user.name || "Anonymous",
                    avatar: user.steam_avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.name || idx}`,
                    totalWagered: Number(user.wagered) || 0
                }));
        },
        getMeta: (data: any) => {
            if (!data) return null;
            const prizes: Record<number, number> = {};
            if (Array.isArray(data.prizes)) {
                data.prizes.forEach((amount: number, idx: number) => {
                    prizes[idx + 1] = amount;
                });
            }
            return {
                startDate: new Date(data.dateStart),
                endDate: new Date(data.dateEnd),
                prizes
            };
        }
    },
};
