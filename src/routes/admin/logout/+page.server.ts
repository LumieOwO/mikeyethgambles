import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { clearAdminSession } from "$lib/server/admin/auth";

export const load: PageServerLoad = async ({ cookies }) => {
    clearAdminSession(cookies);
    throw redirect(302, "/admin/login");
};
