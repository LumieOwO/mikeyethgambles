<script lang="ts">
	import YoutubeFeedCarousel from '$lib/components/home/youtube-feed-carousel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CdnUrl } from '$lib/data/config';
	import type { Icreator, IYoutubeFeed } from '$lib/server/data/types';
	import { formatCurrency, normalizeSiteName } from '$lib/utils';
	import clsx from 'clsx';
	import { onMount } from 'svelte';
	let { data }: { data: { creator: Icreator }; children: any } = $props();
	const homeImagesPath = '/images/home/';
	const globalCodePerks = ['Exclusive leaderboard', 'VIP Rewards'];

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
	let cards: HTMLElement[] = $state([]);

	function handleMouseMove(e: MouseEvent, card: HTMLElement) {
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		const rotateX = ((y - centerY) / centerY) * 20;
		const rotateY = ((x - centerX) / centerX) * -20;

		card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
	}

	function handleMouseLeave(card: HTMLElement) {
		card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
	}
	let youtubeFeed: IYoutubeFeed | null = $state(null);

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
		{ pct: 62, alpha: 0.004 },
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
			left: r(1) * 90 + 5,                    // 5% to 95%
			size: r(2) * 3.8 + 2,                    // 2px to 5.8px
			duration: r(3) * 6 + 8,                  // 8s to 14s
			delay: -(r(4) * 14),                     // -0 to -14s stagger
			opacity: r(5) * 0.45 + 0.2,              // 0.2 to 0.65
		};
	});

	onMount(async () => {
		youtubeFeed = await fetchYouTubeFeed();
	});
</script>

<!-- Hero section — fills the entire viewport -->
<div class="relative flex min-h-[100dvh] overflow-x-hidden w-full justify-between max-[1520px]:justify-center">
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
		class="animate-gentle-pulse relative max-h-[667px] scale-x-[-1] select-none self-center max-[1750px]:h-[600px] max-[1750px]:w-[400px] max-[1520px]:hidden"
	/>
	<div class="relative flex flex-col items-center justify-center gap-[55px]">
		<div class="flex max-w-[586px] flex-col justify-center gap-3">
			<div class="flex flex-col items-center gap-8">
				<div class="entrance" style="--d:0ms">
					<img
						alt="{data.creator.name}'s brand"
						src="/images/home/profile-picture.png"
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
		<div class="flex flex-col gap-1.5">
			<p
				class="entrance animate-gradient-flow relative bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-center text-[30px] font-semibold text-transparent"
				style="--d:700ms"
			>
				Use code "<span
					class="animate-gradient-flow bg-gradient-to-r from-[#ffcc33] via-[#a87600] to-[#f7db88] bg-clip-text text-transparent"
					>{data.creator.code}</span
				>"
			</p>
		</div>
	</div>
	<img
		alt="penguin"
		width="555"
		height="667"
		class="animate-gentle-pulse relative max-h-[667px] select-none self-center max-[1750px]:h-[600px] max-[1750px]:w-[400px] max-[1520px]:hidden"
		src="{homeImagesPath}penguin.png"
	/>
</div>

<!-- Below-fold section — partners, cards, marquee -->
<div class="flex w-full flex-col items-center gap-[55px] pb-[90px] pt-[60px]">
	<div
		class="entrance text-center font-['Source_Code_Pro',monospace] text-[17px] font-semibold text-[#777777] uppercase"
		style="--d:800ms"
	>
		Current Partners:
	</div>
	<div
		class="flex items-center justify-center gap-[40px] max-[800px]:grid max-[800px]:grid-cols-2 max-[505px]:flex max-[505px]:flex-col min-[800px]:w-full min-[800px]:gap-[60px]"
	>
		{#each data.creator.websiteLeaderboards ?? [] as { primaryColor, href, prizes, siteName, highlightedWord }, i}
				<div class="entrance" style={`--d:${900 + i * 150}ms`}>
					<a
						{href}
						target="_blank"
						bind:this={cards[i]}
						onmousemove={(e) => handleMouseMove(e, cards[i])}
						onmouseleave={() => handleMouseLeave(cards[i])}
						class="group relative flex w-[240px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 will-change-transform hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
						style={`--primary-color:${primaryColor}; --card-glow:${primaryColor}`}
					>
						<!-- Glare sweep overlay -->
						<div class="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
							<div class="animate-glare-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"></div>
						</div>

						<!-- Glow border effect on hover -->
						<div
							class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							style={`box-shadow: inset 0 0 20px ${primaryColor}15, 0 0 30px ${primaryColor}20`}
						></div>

						<img
							class="mb-4 h-[70px] w-auto self-center object-contain"
							src={`/images/websites/logos/${normalizeSiteName(siteName)}.png`}
							alt={`${siteName}'s logo'`}
						/>

						<div class="mb-1 text-center text-[18px] font-semibold">
							{@html siteName.replace(
								new RegExp(highlightedWord, 'g'),
								`<span class="text-[var(--primary-color)]">${highlightedWord}</span>`
							)}
						</div>

						<p
							class={clsx(
								'mb-4 flex items-center justify-center gap-1.5 text-center text-[22px] font-bold uppercase',
								prizes ? 'text-white' : 'text-[#777777]'
							)}
						>
							{#if prizes}
								<img
									src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
									alt="currency"
									width="18"
									height="17"
									onerror={(e) => {
										e.currentTarget.outerHTML = '$';
									}}
								/>
								{formatCurrency(
									(Object.values(prizes) as number[]).reduce((sum, val) => sum + val, 0),
									0
								)}
							{:else}
								SOON
							{/if}
						</p>

						<div class="mb-4 flex flex-col gap-3">
							<p class="text-[13px] font-semibold text-[#777777] uppercase">Code perks:</p>
							<div class="flex flex-col gap-3">
								{#each siteName === "GoldPump.com"
	? ["100% affiliate kickback", "15% deposit bonus"]
	: globalCodePerks as perk}
									<div class="group/perk flex items-center gap-2 text-[14px] font-medium">
										<svg
											width="14"
											height="13"
											viewBox="0 0 14 13"
											xmlns="http://www.w3.org/2000/svg"
											class="shrink-0 transition-transform duration-300 group-hover/perk:scale-110"
										>
											<path
												d="M1 7.00673L4.17971 10.5533L12.6182 2.11487"
												stroke="var(--primary-color)"
												stroke-width="2.5"
												stroke-linecap="round"
											/>
										</svg>
										{perk}
									</div>
								{/each}
							</div>
						</div>

						<Button
							class="group/btn mt-auto flex w-full items-center justify-center gap-2 bg-[var(--primary-color)] py-5 transition-colors"
						>
							Sign up
							<img
								alt="forward pointing arrow"
								width="14"
								height="14"
								src="{homeImagesPath}/icons/arrow-forward.svg"
								class="transition-transform duration-300 group-hover/btn:translate-x-1 group-active/btn:translate-x-2"
							/>
						</Button>
					</a>
				</div>
		{/each}
	</div>

	<div class="entrance w-[730px] overflow-hidden" style={`--d:${900 + ((data.creator.websiteLeaderboards ?? []).length) * 150 + 200}ms`}>
		<div class="flex animate-[animation:marquee_10s_linear_infinite] whitespace-nowrap">
			{#each [...data.creator.websiteLeaderboards, ...data.creator.websiteLeaderboards, ...data.creator.websiteLeaderboards, ...data.creator.websiteLeaderboards] as { siteName }}
				<img
					class="mx-5 h-22 w-auto"
					src={`/images/websites/logos/${normalizeSiteName(siteName)}.png`}
					alt={`${siteName} logo`}
				/>
			{/each}
		</div>
	</div>

	<!-- 		<div class="flex flex-row items-center justify-center gap-[18px]">
		<Button
			size="icon"
			class="group flex size-[26px] items-center justify-center rounded-md bg-[{data.creator.primaryColor}]"
		>
			<img
				alt="forward pointing arrow"
				width="12"
				height="12"
				src="{homeImagesPath}/icons/arrow-forward.svg"
				class="rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5 group-active:-translate-x-1"
			/>
		</Button>
		<div class="flex flex-col justify-center gap-1.5 text-center">
			<p class="text-3xl font-semibold">Watch my latest content</p>
			<p class="font-['Source_Code_Pro',monospace] text-lg font-semibold text-[#777777]">
				CLICK BELOW FOR RECENT VIDEOS
			</p>
		</div>
		<Button
			size="icon"
			class="group flex size-[26px] items-center justify-center rounded-md bg-[{data.creator.primaryColor}]"
		>
			<img
				alt="forward pointing arrow"
				width="12"
				height="12"
				src="{homeImagesPath}/icons/arrow-forward.svg"
				class="transition-transform duration-300 group-hover:translate-x-0.5 group-active:translate-x-1"
			/>
		</Button>
	</div>
	 -->
</div>
