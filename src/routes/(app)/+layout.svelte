<script lang="ts">
	import Footer from '$lib/components/layout/footer/footer.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import type { Icreator } from '$lib/types';

	let { children, data }: { data: { creator: Icreator }; children: any } = $props();

	const creator = data.creator;
	const title = `${creator.name} — Leaderboard & Community`;
	const description = `Enjoy rewards & VIP perks for playing under the code: '${creator.code.toLowerCase()}'`;
	const url = `https://${creator.name.toLowerCase()}.wagerlb.com`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div style={`--primary-color:${creator.primaryColor}`}>
	<Header {creator} />
	<div class="flex min-h-[calc(100vh+90px)] flex-col">
		{@render children?.()}
	</div>
	<Footer {creator} />
</div>
