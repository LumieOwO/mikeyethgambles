import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { adminKeys } from "$lib/server/admin/redis-keys";

interface BonusData {
    id: string;
    casino: string;
    code: string;
    href: string;
    mainBonus: string;
    extraBonus: string;
    logoUrl: string;
    color: string;
}

const KNOWN_CASINOS: Record<string, { color: string; logo: string }> = {
    "MM2Wild.com": { color: "#f3b239", logo: "MM2Wild-com" },
    "CSGOWIN.com": { color: "#f59e0b", logo: "csgowin-com" },
    "Harvester.gg": { color: "#4ade80", logo: "harvester-gg" },
};

export const load: PageServerLoad = async () => {
    const bonusIds = await redis.smembers(adminKeys.bonusesSet);
    const bonuses: BonusData[] = [];

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

    return { bonuses, knownCasinos: Object.keys(KNOWN_CASINOS) };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const form = await request.formData();
        const casino = (form.get("casino") as string)?.trim();
        const codeOrLink = (form.get("codeOrLink") as string)?.trim();
        const mainBonus = (form.get("mainBonus") as string)?.trim() || "";
        const extraBonus = (form.get("extraBonus") as string)?.trim() || "";

        if (!casino) return fail(400, { error: "Casino is required" });
        if (!codeOrLink) return fail(400, { error: "Affiliate code or link is required" });

        // Parse code and href from the input
        let code = codeOrLink;
        let href = "";
        try {
            const url = new URL(codeOrLink);
            href = codeOrLink;
            // Try to extract code from URL params
            const cParam = url.searchParams.get("c") || url.searchParams.get("r") || url.searchParams.get("ref") || url.searchParams.get("code");
            if (cParam) code = cParam;
            else {
                // Try path-based: /r/CODE or /ref/CODE
                const pathParts = url.pathname.split("/").filter(Boolean);
                if (pathParts.length >= 2) code = pathParts[pathParts.length - 1];
                else code = codeOrLink;
            }
        } catch {
            // Not a URL, treat as code
            code = codeOrLink;
        }

        const known = KNOWN_CASINOS[casino];
        const color = known?.color || "#ffffff";
        const logoUrl = known ? `/images/websites/logos/${known.logo}.png` : "";

        if (!href && known) {
            href = "#"; // Placeholder if no link provided
        }

        const id = `bonus-${Date.now()}`;
        await redis.sadd(adminKeys.bonusesSet, id);
        await redis.hset(adminKeys.bonus(id), {
            casino,
            code,
            href,
            mainBonus,
            extraBonus,
            logoUrl,
            color,
        });

        return { success: true };
    },

    update: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const casino = (form.get("casino") as string)?.trim();
        const code = (form.get("code") as string)?.trim();
        const href = (form.get("href") as string)?.trim();
        const mainBonus = (form.get("mainBonus") as string)?.trim() || "";
        const extraBonus = (form.get("extraBonus") as string)?.trim() || "";

        if (!id) return fail(400, { error: "Missing bonus ID" });

        const exists = await redis.sismember(adminKeys.bonusesSet, id);
        if (!exists) return fail(404, { error: "Bonus not found" });

        const known = KNOWN_CASINOS[casino || ""];
        const color = known?.color || "#ffffff";
        const logoUrl = known ? `/images/websites/logos/${known.logo}.png` : "";

        await redis.hset(adminKeys.bonus(id), {
            casino: casino || "",
            code: code || "",
            href: href || "",
            mainBonus,
            extraBonus,
            logoUrl,
            color,
        });

        return { success: true };
    },

    delete: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        if (!id) return fail(400, { error: "Missing bonus ID" });

        await redis.srem(adminKeys.bonusesSet, id);
        await redis.del(adminKeys.bonus(id));

        return { success: true };
    },
};
