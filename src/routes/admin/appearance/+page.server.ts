import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { redis } from "$lib/server/redis";
import { adminKeys } from "$lib/server/admin/redis-keys";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.resolve("static/uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const load: PageServerLoad = async () => {
    const data = await redis.hgetall(adminKeys.appearance);
    return {
        logoUrl: data.logoUrl || "/images/home/profile-picture.png",
        primaryColor: data.primaryColor || "",
    };
};

export const actions: Actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get("logo") as File | null;

        if (!file || file.size === 0) {
            return fail(400, { error: "No file selected" });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return fail(400, { error: "Invalid file type. Use PNG, JPG, WebP, or GIF." });
        }

        if (file.size > MAX_FILE_SIZE) {
            return fail(400, { error: "File too large. Max 5MB." });
        }

        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        const ext = file.name.split(".").pop() || "png";
        const filename = `logo-${Date.now()}.${ext}`;
        const filePath = path.join(UPLOAD_DIR, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${filename}`;
        await redis.hset(adminKeys.appearance, { logoUrl: publicUrl });

        return { success: true, logoUrl: publicUrl };
    },

    color: async ({ request }) => {
        const formData = await request.formData();
        const color = (formData.get("primaryColor") as string) || "";

        if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
            return fail(400, { error: "Invalid hex color" });
        }

        await redis.hset(adminKeys.appearance, { primaryColor: color });
        return { success: true, colorSaved: true };
    },
};
