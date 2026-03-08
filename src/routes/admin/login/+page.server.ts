import { redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { checkPassword, createAdminSession, validateAdminSession } from "$lib/server/admin/auth";

export const load: PageServerLoad = async ({ cookies }) => {
    if (validateAdminSession(cookies)) {
        throw redirect(302, "/admin/socials");
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get("password") as string;

        if (!password || !checkPassword(password)) {
            return fail(400, { error: "Invalid password" });
        }

        createAdminSession(cookies);
        throw redirect(302, "/admin/socials");
    },
};
