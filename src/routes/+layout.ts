import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, fetch }) => {
    const sub = 'sack';

    const creator = await (await fetch(`/api/creators/${sub}`, { method: "GET" })).json()
    return { creator, sub };
};
