import { building } from "$app/environment";
import { redirect, type Handle } from "@sveltejs/kit";
import { creator } from "$lib/server/data/creators";
import { initLeaderboards } from "$lib/server/utilities/leaderboard";
import { validateAdminSession } from "$lib/server/admin/auth";

if (!building) {
    initLeaderboards(creator);
}

export const handle: Handle = async ({ event, resolve }) => {
    const path = event.url.pathname;

    if (path.startsWith("/admin") && path !== "/admin/login") {
        const isValid = validateAdminSession(event.cookies);
        if (!isValid) {
            throw redirect(302, "/admin/login");
        }
    }

    return resolve(event);
};
