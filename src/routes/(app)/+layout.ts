import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
    const sub = 'mikey';

    const creator = await (await fetch(`/api/creators/${sub}`, { method: "GET" })).json()
    return { creator, sub };
};
