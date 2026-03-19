<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import BonusCard from '$lib/components/bonus-card.svelte';
	import type { Icreator, IYoutubeFeed } from '$lib/types';
	import { normalizeSiteName } from '$lib/utils';
	import { onMount } from 'svelte';
	let { data }: { data: { creator: Icreator }; children: any } = $props();
	const homeImagesPath = '/images/home/';

	async function fetchYouTubeFeed(): Promise<IYoutubeFeed | null> {
		const channelURL = encodeURIComponent(
			`https://www.youtube.com/feeds/videos.xml?channel_id=${data.creator.cid}`
		);
		const reqURL = `https://api.rss2json.com/v1/api.json?rss_url=${channelURL}`;

		try {
			const response = await fetch(reqURL);
			const result: IYoutubeFeed = await response.json();
			return result;
		} catch (error) {
			console.error('error', error);
			return null;
		}
	}
	let youtubeFeed: IYoutubeFeed | null = $state(null);
	let copiedCode = $state(false);

	function copyCode() {
		navigator.clipboard.writeText(data.creator.code);
		copiedCode = true;
		setTimeout(() => (copiedCode = false), 2000);
	}

	interface CardData {
		logo: string;
		name: string;
		color: string;
		code: string;
		href: string;
		mainReward: string;
		rewardLines: string[];
		i: number;
	}

	let allCards = $derived.by((): CardData[] => {
		return (data.creator.bonuses ?? []).map((b, i) => ({
			logo: b.logoUrl || '',
			name: b.casino,
			color: b.color || '#ffffff',
			code: b.code,
			href: b.href,
			mainReward: b.mainBonus || '',
			rewardLines: b.extraBonus ? [b.extraBonus] : [],
			i
		}));
	});

	const hasLeaderboards = data.creator.websiteLeaderboards?.length > 0;
	const firstLb = data.creator.websiteLeaderboards?.[0];

	function hexToRgb(hex: string): string {
		const h = hex.replace('#', '');
		const r = parseInt(h.substring(0, 2), 16);
		const g = parseInt(h.substring(2, 4), 16);
		const b = parseInt(h.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	}

	const primaryRgb = hexToRgb(data.creator.primaryColor);

	const glowStops = [
		{ pct: 0, alpha: 0.082 },
		{ pct: 10, alpha: 0.07 },
		{ pct: 18, alpha: 0.055 },
		{ pct: 26, alpha: 0.04 },
		{ pct: 34, alpha: 0.027 },
		{ pct: 42, alpha: 0.02 },
		{ pct: 52, alpha: 0.01 },
		{ pct: 62, alpha: 0.004 }
	];
	const glowGradient = `radial-gradient(circle at 50% 40%, ${glowStops.map((s) => `rgba(${primaryRgb}, ${s.alpha}) ${s.pct}%`).join(', ')}, transparent 75%)`;

	function scrollToBonuses() {
		document.getElementById('bonuses')?.scrollIntoView({ behavior: 'smooth' });
	}

	onMount(async () => {
		youtubeFeed = await fetchYouTubeFeed();
	});
</script>

<!-- Hero section — fills the entire viewport -->
<div
	class="relative flex min-h-[100dvh] w-full justify-between overflow-x-hidden max-[1520px]:justify-center"
>
	<!-- Radial glow background -->
	<div class="absolute inset-0" style={`background: ${glowGradient}`}></div>

	<!-- Moving blobs -->
	<div
		class="blob pointer-events-none absolute rounded-full"
		style={`width: 420px; height: 420px; top: 15%; left: 18%; background: rgba(${primaryRgb}, 0.04); filter: blur(80px); animation: blob-drift-1 20s ease-in-out infinite;`}
	></div>
	<div
		class="blob pointer-events-none absolute rounded-full"
		style={`width: 350px; height: 350px; top: 35%; right: 12%; background: rgba(${primaryRgb}, 0.03); filter: blur(80px); animation: blob-drift-2 25s ease-in-out infinite;`}
	></div>

	<img
		alt="penguin"
		width="555"
		height="667"
		src={`${homeImagesPath}penguin.png`}
		class="animate-gentle-pulse relative max-h-[667px] scale-x-[-1] self-center opacity-0 select-none max-[1750px]:h-[600px] max-[1750px]:w-[400px] max-[1520px]:hidden"
	/>
	<div class="relative flex flex-col items-center justify-center gap-[55px]">
		<div class="flex max-w-[586px] flex-col justify-center gap-3">
			<div class="flex flex-col items-center gap-8">
				<div class="entrance" style="--d:0ms">
					<img
						alt="{data.creator.name}'s brand"
						src={data.creator.logoUrl || '/images/home/profile-picture.png'}
						width="140"
						height="140"
						class="animate-float rounded-xl will-change-transform"
					/>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<p class="entrance text-xl font-semibold md:text-2xl" style="--d:300ms">
					Welcome to <span class="text-[var(--primary-color)]">{data.creator.name}</span>
				</p>
				<p
					class="entrance text-center text-[15px] text-[#6b7280] max-[610px]:text-[12px] max-[530px]:text-[14px]"
					style="--d:400ms"
				>
					Use code <span class="font-bold text-[var(--primary-color)]">{data.creator.code}</span> on any partner site for exclusive deposit bonuses and rewards.
				</p>

				<!-- CTAs -->
				<div class="entrance mt-4 flex flex-col items-center gap-3 sm:flex-row" style="--d:500ms">
					<a href="#bonuses" class="group" onclick={(e) => { e.preventDefault(); scrollToBonuses(); }}>
						<button
							class="flex cursor-pointer items-center gap-2.5 rounded-xl px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110"
							style={`background: linear-gradient(135deg, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, #000)); box-shadow: 0 0 20px rgba(${primaryRgb}, 0.3), inset 0 1px 0 rgba(255,255,255,0.15);`}
						>
							Claim Bonuses
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
						</button>
					</a>
					{#if hasLeaderboards}
						<a href={`/leaderboard/${normalizeSiteName(firstLb.siteName)}`}>
							<button class="flex cursor-pointer items-center gap-2 rounded-xl border border-[#2a2d35] bg-[#111318]/80 px-7 py-3.5 text-[15px] font-semibold text-[#c4c7d4] backdrop-blur-sm transition-all duration-200 hover:border-[#3a3d45] hover:text-white">
								View Leaderboards
							</button>
						</a>
					{/if}
				</div>

				<!-- Code pill -->
				<button
					class="entrance mt-2 flex cursor-pointer items-center gap-3 rounded-full border border-[#2a2d35] bg-[#0e1018]/80 px-5 py-2.5 backdrop-blur-sm transition-all duration-200 hover:border-[#3a3d45]"
					style="--d:600ms"
					onclick={copyCode}
				>
					<span class="text-[13px] text-[#6b7280]">Code:</span>
					<span class="text-[14px] font-bold" style="color: var(--primary-color);">{data.creator.code}</span>
					{#if copiedCode}
						<span class="text-[12px] font-semibold text-emerald-400">Copied!</span>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
					{/if}
				</button>

				<!-- Socials -->
				<div
					class="mt-2 grid w-[370px] grid-cols-2 justify-items-center gap-3.5 max-[420px]:w-[320px]"
				>
					{#each data.creator.socials as { cardBackground, href, title, icon }, i}
						<div class="entrance w-full" style={`--d:${700 + i * 100}ms`}>
							<Button
								{href}
								target="_blank"
								class={`flex h-[50px] w-full justify-center gap-1 rounded-[8px] px-5 text-[14px] font-medium hover:border-white/30 ${cardBackground} `}
							>
								<img
									src={`${homeImagesPath}icons/socials/${icon}`}
									width="20"
									height="14"
									alt={`${title}'s ${icon}`}
								/>
								{title}
							</Button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<img
		alt="penguin"
		width="555"
		height="667"
		class="animate-gentle-pulse relative max-h-[667px] self-center opacity-0 select-none max-[1750px]:h-[600px] max-[1750px]:w-[400px] max-[1520px]:hidden"
		src="{homeImagesPath}penguin.png"
	/>

	<!-- Scroll indicator -->
	<button
		class="entrance absolute bottom-8 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 border-none bg-transparent opacity-50"
		style="--d:900ms"
		onclick={scrollToBonuses}
	>
		<span class="text-[11px] font-medium uppercase tracking-[2px] text-[#4b5063]">Scroll</span>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5063" stroke-width="2" stroke-linecap="round" class="animate-float">
			<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
		</svg>
	</button>
</div>

<!-- Below-fold section — Exclusive Bonuses -->
<div id="bonuses" class="flex w-full flex-col items-center gap-12 pt-[60px] pb-[90px]">
	<div class="entrance text-center" style="--d:700ms">
		<h2 class="mb-2 text-3xl font-black md:text-4xl" style="color: #fef3e2;">EXCLUSIVE BONUSES</h2>
		<p class="text-[15px] text-[#6b7280]">
			Use code <span
				class="animate-gradient-flow bg-gradient-to-r from-[#ffcc33] via-[#a87600] to-[#f7db88] bg-clip-text font-bold text-transparent"
				>{data.creator.code}</span
			> on any partner site for exclusive deposit bonuses and rewards.
		</p>
	</div>

	<div class="flex flex-wrap justify-center gap-6 px-4">
		{#each allCards as card}
			<div class="entrance w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]" style={`--d:${800 + card.i * 120}ms;`}>
				<BonusCard
					logo={card.logo}
					name={card.name}
					color={card.color}
					code={card.code}
					href={card.href}
					mainReward={card.mainReward}
					rewardLines={card.rewardLines}
					onCopyCode={copyCode}
				/>
			</div>
		{/each}
	</div>
</div>
