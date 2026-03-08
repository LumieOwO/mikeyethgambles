import { ADMIN_PASSWORD } from "$env/static/private";
import type { Cookies } from "@sveltejs/kit";
import { createHmac } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function sign(value: string): string {
    return createHmac("sha256", ADMIN_PASSWORD).update(value).digest("hex");
}

export function createAdminSession(cookies: Cookies) {
    const timestamp = Date.now().toString();
    const signature = sign(timestamp);
    const token = `${timestamp}.${signature}`;

    cookies.set(COOKIE_NAME, token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: MAX_AGE,
    });
}

export function validateAdminSession(cookies: Cookies): boolean {
    const token = cookies.get(COOKIE_NAME);
    if (!token) return false;

    const [timestamp, signature] = token.split(".");
    if (!timestamp || !signature) return false;

    const expected = sign(timestamp);
    if (signature !== expected) return false;

    const age = Date.now() - Number(timestamp);
    if (age > MAX_AGE * 1000) return false;

    return true;
}

export function clearAdminSession(cookies: Cookies) {
    cookies.delete(COOKIE_NAME, { path: "/" });
}

export function checkPassword(password: string): boolean {
    return password === ADMIN_PASSWORD;
}
