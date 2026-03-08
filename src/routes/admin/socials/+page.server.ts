import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { adminKeys } from "$lib/server/admin/redis-keys";

interface SocialLink {
    id: string;
    platform: string;
    url: string;
    title: string;
}

const PLATFORM_LABELS: Record<string, string> = {
    youtube: "YouTube",
    discord: "Discord",
    tiktok: "TikTok",
    twitter: "X / Twitter",
    twitch: "Twitch",
    kick: "Kick",
};

const SOCIALS_KEY = adminKeys.socials;

async function loadSocials(): Promise<SocialLink[]> {
    const keyType = await redis.type(SOCIALS_KEY);
    if (keyType === "string") {
        const raw = await redis.get(SOCIALS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) as SocialLink[];
        } catch {
            return [];
        }
    } else if (keyType === "hash") {
        // Migrate old hash format to new JSON array
        const data = await redis.hgetall(SOCIALS_KEY);
        const platforms = Object.keys(PLATFORM_LABELS);
        const socials: SocialLink[] = [];
        for (const p of platforms) {
            if (data[`${p}_enabled`] === "true" && data[`${p}_url`]) {
                socials.push({
                    id: crypto.randomUUID(),
                    platform: p,
                    url: data[`${p}_url`],
                    title: data[`${p}_title`] || PLATFORM_LABELS[p],
                });
            }
        }
        // Migrate
        await redis.del(SOCIALS_KEY);
        if (socials.length > 0) {
            await redis.set(SOCIALS_KEY, JSON.stringify(socials));
        }
        return socials;
    }
    return [];
}

async function saveSocials(socials: SocialLink[]) {
    await redis.set(SOCIALS_KEY, JSON.stringify(socials));
}

export const load: PageServerLoad = async () => {
    const socials = await loadSocials();
    return { socials };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const platform = formData.get("platform") as string;
        const url = (formData.get("url") as string)?.trim();

        if (!platform || !url) {
            return fail(400, { error: "Platform and URL are required." });
        }

        const label = PLATFORM_LABELS[platform];
        if (!label) {
            return fail(400, { error: "Invalid platform." });
        }

        if (!isValidUrl(url)) {
            return fail(400, { error: "Please enter a valid URL." });
        }

        const socials = await loadSocials();
        socials.push({
            id: crypto.randomUUID(),
            platform,
            url,
            title: label,
        });
        await saveSocials(socials);
        return { success: true };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get("id") as string;
        if (!id) return fail(400, { error: "Missing id." });

        const socials = await loadSocials();
        await saveSocials(socials.filter(s => s.id !== id));
        return { success: true };
    },
};

function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}
