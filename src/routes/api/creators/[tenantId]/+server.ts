import { creators } from "$lib/server/data/creators";
import { type RequestHandler, error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { tenantId } = params;
        if (!tenantId) throw error(400, 'Missing parameters');

        const tenant = creators[tenantId];
        if (!tenant) throw error(404, 'Tenant not found');

        const sanitizedTenant = {
            ...tenant,
            websiteLeaderboards: tenant.websiteLeaderboards.map(lb => {
                const { apiKey, ...rest } = lb;
                return rest;
            })
        };

        return json(sanitizedTenant);
    } catch (err: any) {
        if (err?.status && err?.body) throw err;
        console.error(err);
        throw error(500, 'Internal Server Error');
    }
};
