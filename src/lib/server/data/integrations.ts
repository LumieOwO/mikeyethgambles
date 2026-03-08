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


};
