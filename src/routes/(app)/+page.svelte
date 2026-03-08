<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Icreator, IYoutubeFeed } from '$lib/types';
	import { formatCurrency, normalizeSiteName } from '$lib/utils';
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

	// Convert hex color to rgb components
	function hexToRgb(hex: string): string {
		const h = hex.replace('#', '');
		const r = parseInt(h.substring(0, 2), 16);
		const g = parseInt(h.substring(2, 4), 16);
		const b = parseInt(h.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	}

	const primaryRgb = hexToRgb(data.creator.primaryColor);

	// Generate radial glow gradient stops using primary color
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

	// Generate particles programmatically — DRY approach using seed-like math
	function seededRandom(seed: number): number {
		const x = Math.sin(seed * 9301 + 49297) * 49297;
		return x - Math.floor(x);
	}

	interface Particle {
		left: number;
		size: number;
		duration: number;
		delay: number;
		opacity: number;
	}

	const PARTICLE_COUNT = 30;
	const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
		const r = (offset: number) => seededRandom(i * 7 + offset);
		return {
			left: r(1) * 90 + 5, // 5% to 95%
			size: r(2) * 3.8 + 2, // 2px to 5.8px
			duration: r(3) * 6 + 8, // 8s to 14s
			delay: -(r(4) * 14), // -0 to -14s stagger
			opacity: r(5) * 0.45 + 0.2 // 0.2 to 0.65
		};
	});

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

	<!-- Floating particles -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		{#each particles as p}
			<div
				class="absolute rounded-full"
				style={`
					left: ${p.left}%;
					width: ${p.size}px;
					height: ${p.size}px;
					background-color: rgb(${primaryRgb});
					box-shadow: rgb(${primaryRgb}) 0px 0px ${p.size * 2}px;
					animation: float-up ${p.duration}s ease-in-out ${p.delay}s infinite;
					--particle-opacity: ${p.opacity};
				`}
			></div>
		{/each}
	</div>

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
				<div class="entrance flex items-center gap-1" style="--d:150ms">
					<img
						width="22"
						height="18"
						src={`${homeImagesPath}icons/warning.svg`}
						alt="warning vector"
					/>
					<p class="text-xs text-[#FF9131]">GAMBLE RESPONSIBLY</p>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<p
					class="entrance text-[40px] font-semibold max-[530px]:text-[30px] max-[340px]:text-[24px]"
					style="--d:300ms"
				>
					Hey there, I'm <span class="text-[var(--primary-color)]">{data.creator.name}</span>
				</p>
				<p
					class="entrance text-center text-[17px] font-bold text-[#777777] max-[610px]:text-[12px] max-[530px]:text-[14px]"
					style="--d:400ms"
				>
					{data.creator.description}
				</p>
				<div
					class="mt-4 grid w-[370px] grid-cols-2 justify-items-center gap-3.5 max-[420px]:w-[320px]"
				>
					{#each data.creator.socials as { cardBackground, href, title, icon }, i}
						<div class="entrance w-full" style={`--d:${500 + i * 100}ms`}>
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
</div>

<!-- Below-fold section — partners & cards -->
<div class="flex w-full flex-col items-center gap-12 pt-[60px] pb-[90px]">
	<div class="entrance flex flex-col items-center gap-2 text-center" style="--d:700ms">
		<p
			class="animate-gradient-flow bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-[30px] font-semibold text-transparent"
		>
			Use code "<span
				class="animate-gradient-flow bg-gradient-to-r from-[#ffcc33] via-[#a87600] to-[#f7db88] bg-clip-text text-transparent"
				>{data.creator.code}</span
			>"
		</p>
		<p
			class="font-['Source_Code_Pro',monospace] text-[14px] font-semibold tracking-[2px] text-[#6b7280] uppercase"
		>
			Current Partners
		</p>
	</div>

	<div class="grid grid-cols-1 justify-center gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each allCards as card}
			<div
				class="entrance grid grid-rows-[auto_1fr_auto_auto] rounded-xl border border-[#2a2d35] bg-[#111318] p-6"
				style={`--d:${800 + card.i * 120}ms;`}
			>
				<!-- Row 1: Logo -->
				<div class="mb-4 flex h-10 items-center justify-center">
					{#if card.logo}
						<img alt={card.name} class="h-full object-contain" src={card.logo} />
					{:else}
						<span class="text-lg font-bold text-white/80">{card.name}</span>
					{/if}
				</div>

				<!-- Row 2: Rewards (stretches to fill) -->
				<div class="mb-4">
					<div
						class="mb-2 text-center text-xs font-bold tracking-wider uppercase"
						style="color: #6b7280;"
					>
						REWARDS
					</div>
					<div class="space-y-1">
						{#if card.mainReward}
							<div class="text-center text-sm font-bold" style="color: #fef3e2;">
								{card.mainReward}
							</div>
						{/if}
						{#each card.rewardLines as line}
							<div class="text-center text-xs" style="color: #fef3e2;">
								{line}
							</div>
						{/each}
						{#if !card.mainReward && card.rewardLines.length === 0}
							<div class="text-center text-sm font-bold" style="color: #fef3e2;">COMING SOON</div>
						{/if}
					</div>
				</div>

				<!-- Row 3: Code box -->
				<div
					class="mb-4 flex items-center justify-between rounded-lg bg-[#0a0c14] px-3 py-2"
				>
					<span class="text-xs" style="color: #6b7280;">Code:</span>
					<div class="flex items-center gap-1">
						<span class="text-sm font-bold" style={`color: ${card.color};`}>{card.code}</span>
						<button
							class="rounded p-1 transition-colors hover:bg-white/10"
							style="color: #6b7280;"
							onclick={copyCode}
						>
							{#if copiedCode}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<!-- Row 4: CTA Button -->
				<a href={card.href} target="_blank" rel="noopener noreferrer">
					<button
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-black"
						style={`background-color: ${card.color}; box-shadow: rgba(255,255,255,0.3) 0px 2px 0px 0px inset, rgba(0,0,0,0.04) 0px 4px 6px;`}
					>
						CLAIM BONUS
					</button>
				</a>
			</div>
		{/each}
	</div>
</div>
