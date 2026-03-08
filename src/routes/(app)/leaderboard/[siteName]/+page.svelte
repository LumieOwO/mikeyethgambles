<script lang="ts">
	import clsx from 'clsx';
	import type { Icreator, ILeaderboardEntry } from '$lib/types';
	import { formatCurrency, normalizeSiteName } from '$lib/utils';
	import { page } from '$app/stores';
	import Countdown from '$lib/components/countdown.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import NumberFlow from '@number-flow/svelte';

	let { data }: { data: { creator: Icreator; sub: string }; children: any } = $props();

	let previous = $state(false);
	let hasIcon = $state(true);
	let siteName = $state($page.params.siteName ?? '');
	let normalizedParam = $derived(normalizeSiteName(siteName));

	$effect(() => {
		siteName = $page.params.siteName ?? '';
	});

	let leaderboardDate:
		| undefined
		| {
				tenantId: string;
				leaderboardId: string;
				entries: ILeaderboardEntry[];
				cachedUntil: number;
				prize: string;
				duration: any;
		  } = $state();

	let loading = $state(true);
	let secondsLeft = $state(0);

	const placeColors = ['rgb(255,215,0)', 'rgb(192,192,192)', 'rgb(205,127,50)'];

	let leaderboardEntry = $derived(
		data.creator.websiteLeaderboards.find(
			(entry) => normalizeSiteName(entry.siteName) === normalizedParam
		)
	);

	let totalPrize = $derived(
		Object.values(leaderboardEntry?.prizes ?? {}).reduce((sum, val) => sum + val, 0)
	);

	// How many rows to show in the table: max(5, count of prizes > 0)
	let tableRowCount = $derived.by(() => {
		const prizes = leaderboardEntry?.prizes ?? {};
		const positivePrizes = Object.values(prizes).filter((v) => v > 0).length;
		return Math.max(5, positivePrizes);
	});

	// Top 3 in display order: 2nd, 1st, 3rd
	let topThree = $derived.by(() => {
		const sorted = [...(leaderboardDate?.entries ?? [])]
			.sort((a, b) => b.totalWagered - a.totalWagered)
			.slice(0, 3);
		if (sorted.length < 3) return sorted.map((u, i) => ({ ...u, place: i + 1 }));
		return [
			{ ...sorted[1], place: 2 },
			{ ...sorted[0], place: 1 },
			{ ...sorted[2], place: 3 }
		];
	});

	// Tab indicator positioning
	let tabContainer: HTMLElement | undefined = $state();
	let tabRefs: HTMLElement[] = $state([]);
	let indicatorStyle = $state('');

	// All leaderboards show as tabs
	let allTabs = $derived(data.creator.websiteLeaderboards);

	function updateIndicator() {
		const activeIdx = allTabs.findIndex((lb) => normalizeSiteName(lb.siteName) === normalizedParam);
		if (activeIdx >= 0 && tabRefs[activeIdx] && tabContainer) {
			const el = tabRefs[activeIdx];
			const containerRect = tabContainer.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const offsetX = elRect.left - containerRect.left;
			const offsetY = elRect.top - containerRect.top;
			indicatorStyle = `width:${elRect.width}px;height:${elRect.height}px;transform:translate(${offsetX}px,${offsetY}px)`;
		}
	}

	$effect(() => {
		normalizedParam;
		requestAnimationFrame(updateIndicator);
	});

	const fetchLeaderboard = async () => {
		loading = true;
		try {
			const res = await fetch(
				`/api/leaderboard/${data.sub}/${normalizedParam}?previous=${previous}`
			);
			if (!res.ok) throw new Error(res.statusText);
			leaderboardDate = await res.json();

			if (leaderboardDate?.duration?.endingDate) {
				secondsLeft = Math.max(
					Math.floor(
						(new Date(leaderboardDate.duration.endingDate).getTime() - new Date().getTime()) / 1000
					),
					0
				);
			}
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		fetchLeaderboard();
		requestAnimationFrame(updateIndicator);
		const interval = setInterval(() => fetchLeaderboard(), 60 * 60 * 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (normalizedParam) {
			leaderboardDate = undefined;
			loading = true;
			secondsLeft = 0;
			hasIcon = true;
			fetchLeaderboard();
		}
	});

	function getPrize(place: number): number {
		return leaderboardEntry?.prizes?.[place] ?? 0;
	}

	function renderCurrency(amount: number, decimals = 2): string {
		return formatCurrency(amount, decimals);
	}

	// Skeleton podium order: 2nd, 1st, 3rd
	const skeletonPodium = [2, 1, 3];
</script>

<div class="mx-auto w-full max-w-[1100px] px-4 pt-[80px] pb-[100px]">
	<!-- Tab Switcher + Toggle — above everything -->
	<div class="entrance flex flex-col items-center gap-4" style="--d:0ms">
		{#if allTabs.length > 1}
			<div
				bind:this={tabContainer}
				class="relative flex items-center gap-1 rounded-2xl border border-[#2a2d35] bg-[#111318]/80 p-1.5"
			>
				<!-- Sliding indicator -->
				<div
					class="pointer-events-none absolute top-0 left-0 rounded-xl border border-[var(--primary-color)]/25 bg-[var(--primary-color)]/[0.08] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
					style={indicatorStyle}
				></div>
				{#each allTabs as lb, idx}
					<a
						href={`/leaderboard/${normalizeSiteName(lb.siteName)}`}
						bind:this={tabRefs[idx]}
						class={clsx(
							'relative z-10 flex h-[48px] items-center rounded-xl px-5 transition-opacity duration-300',
							normalizeSiteName(lb.siteName) === normalizedParam
								? 'opacity-100'
								: 'opacity-40 hover:opacity-70'
						)}
					>
						<img
							src={`/images/websites/logos/${normalizeSiteName(lb.siteName)}.png`}
							alt={lb.siteName}
							class="h-[30px] w-auto object-contain"
						/>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Previous/Current Toggle -->
		<div class="flex items-center gap-2">
			<button
				class={clsx(
					'relative rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-300',
					!previous
						? 'border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/[0.08] text-white shadow-[0_0_16px_var(--primary-color)/8]'
						: 'border border-[#2a2d35] bg-[#111318]/60 text-[#6b7280] hover:text-[#d1d5db]'
				)}
				onclick={() => {
					previous = false;
					fetchLeaderboard();
				}}
			>
				Current
			</button>
			<button
				class={clsx(
					'relative rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-300',
					previous
						? 'border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/[0.08] text-white shadow-[0_0_16px_var(--primary-color)/8]'
						: 'border border-[#2a2d35] bg-[#111318]/60 text-[#6b7280] hover:text-[#d1d5db]'
				)}
				onclick={() => {
					previous = true;
					fetchLeaderboard();
				}}
			>
				Previous
			</button>
		</div>
	</div>

	<!-- Header -->
	<header class="entrance mt-10 flex flex-col items-center text-center" style="--d:100ms">
		<div
			class="mb-2 flex items-center justify-center gap-3 text-[8px] font-black max-sm:text-[32px] md:text-[42px]"
		>
			<span
				class="text-[var(--primary-color)]"
				style="text-shadow: 0 0 40px color-mix(in srgb, var(--primary-color) 19%, transparent);"
			>
				{#if hasIcon}
					<img
						src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
						alt="currency"
						class="mr-1 inline-block h-[0.6em] w-auto align-middle"
						onerror={() => (hasIcon = false)}
					/>
				{:else}
					$
				{/if}<NumberFlow value={totalPrize} />
			</span>
			<span
				style="color: #fef3e2; text-shadow: 0 0 40px color-mix(in srgb, var(--primary-color) 19%, transparent);"
			>
				{siteName.replace('-', '.').toUpperCase()}
			</span>
		</div>

		<p class="mt-2 max-w-[480px] text-[12px] leading-relaxed text-[#6b7280]">
			We reserve the right to remove or restrict any accounts found to be abusing wagers. If an
			account is found farming wagers through house games, those wagers will be removed.
		</p>
	</header>

	{#if loading && !leaderboardDate}
		<!-- =============== SKELETON =============== -->
		<!-- Skeleton Podium -->
		<div class="mt-14 grid grid-cols-3 items-end gap-5 max-sm:gap-2">
			{#each skeletonPodium as place, i}
				{@const rgbInner = place === 1 ? '255,215,0' : place === 2 ? '192,192,192' : '205,127,50'}
				<div
					class={clsx(
						'flex flex-col items-center overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#111318]',
						place === 1 ? 'pb-6' : place === 2 ? 'mt-8 pb-5' : 'mt-12 pb-5'
					)}
				>
					<div
						class="flex w-full justify-center pb-4"
						style={`padding-top: ${place === 1 ? '2rem' : '1.5rem'}; clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%); background: linear-gradient(180deg, rgba(${rgbInner}, 0.04) 0%, transparent 100%);`}
					>
						<div class="relative">
							<div
								class="skeleton-pulse rounded-full"
								style={`width:${place === 1 ? 80 : 64}px;height:${place === 1 ? 80 : 64}px`}
							></div>
							<div
								class="absolute -bottom-2.5 left-1/2 flex h-[22px] w-[22px] -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-extrabold text-black/50"
								style={`background: rgba(${rgbInner}, 0.3);`}
							>
								{place}
							</div>
						</div>
					</div>
					<div class="mt-4 flex flex-col items-center gap-2 px-3">
						<div class="skeleton-pulse h-4 w-20 rounded"></div>
						<p
							class="font-['Source_Code_Pro',monospace] text-[10px] font-semibold tracking-[2px] text-[#4b5063] uppercase"
						>
							WAGERED
						</p>
						<div class="skeleton-pulse h-4 w-16 rounded"></div>
						<div class="skeleton-pulse mt-1 h-6 w-20 rounded-full"></div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Skeleton Countdown -->
		<div class="mt-10 flex flex-col items-center gap-2.5">
			<div class="skeleton-pulse h-3 w-14 rounded"></div>
			<div class="flex items-center gap-3">
				{#each Array(4) as _}
					<div class="flex flex-col items-center gap-1">
						<div class="skeleton-pulse h-[52px] w-[52px] rounded-lg"></div>
						<div class="skeleton-pulse h-2 w-6 rounded"></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Skeleton Table -->
		<div class="mt-10">
			<div
				class="mb-3 grid grid-cols-12 items-center px-5 py-2 text-[11px] font-semibold tracking-[2px] text-[#3a3d4a] uppercase max-sm:hidden"
			>
				<div class="col-span-1">#</div>
				<div class="col-span-5">User</div>
				<div class="col-span-3 text-right">Wagered</div>
				<div class="col-span-3 text-right">Prize</div>
			</div>
			<div class="flex flex-col gap-[5px]">
				{#each Array(tableRowCount) as _, i}
					<div
						class={clsx(
							'grid grid-cols-12 items-center rounded-xl px-5 py-3 max-sm:flex max-sm:flex-wrap max-sm:gap-2',
							i < 3 ? 'border border-[#2a2d35] bg-[#161820]' : 'bg-[#111318]/50'
						)}
					>
						<div class="col-span-1 max-sm:w-8">
							<div class="skeleton-pulse h-4 w-4 rounded"></div>
						</div>
						<div class="col-span-5 flex items-center gap-3 max-sm:flex-1">
							<div class="skeleton-pulse h-[30px] w-[30px] rounded-full"></div>
							<div class="skeleton-pulse h-3.5 w-24 rounded"></div>
						</div>
						<div class="col-span-3 flex justify-end max-sm:w-full max-sm:justify-between">
							<div class="skeleton-pulse h-3.5 w-20 rounded"></div>
						</div>
						<div class="col-span-3 flex justify-end max-sm:w-full max-sm:justify-between">
							<div class="skeleton-pulse h-3.5 w-16 rounded"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- =============== LOADED CONTENT =============== -->
		<!-- Top 3 Podium -->
		{#if topThree.length >= 3}
			<div class="entrance mt-14 grid grid-cols-3 items-end gap-5 max-sm:gap-2" style="--d:250ms">
				{#each topThree as user, i}
					{@const place = user.place}
					{@const color = placeColors[place - 1]}
					{@const prize = getPrize(place)}
					{@const rgbInner = place === 1 ? '255,215,0' : place === 2 ? '192,192,192' : '205,127,50'}
					<div
						transition:fade={{ delay: i * 120, duration: 400 }}
						class={clsx(
							'group relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#111318] transition-all duration-300 hover:border-[#3a3d45]',
							place === 1 ? 'pb-6' : place === 2 ? 'mt-8 pb-5' : 'mt-12 pb-5'
						)}
						style={`box-shadow: 0 0 40px rgba(${rgbInner}, 0.03);`}
					>
						<!-- Angled top -->
						<div
							class="flex w-full justify-center pb-4"
							style={`padding-top: ${place === 1 ? '2rem' : '1.5rem'}; clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%); background: linear-gradient(180deg, rgba(${rgbInner}, 0.08) 0%, rgba(${rgbInner}, 0.02) 60%, transparent 100%);`}
						>
							<div class="relative">
								<div
									class="rounded-full p-[2px]"
									style={`background: linear-gradient(135deg, ${color}, transparent 70%);`}
								>
									<img
										alt={user.username}
										loading="lazy"
										width={place === 1 ? 80 : 64}
										height={place === 1 ? 80 : 64}
										src={user.avatar}
										class="rounded-full bg-[#111318]"
									/>
								</div>
								<!-- Place badge -->
								<div
									class="absolute -bottom-2.5 left-1/2 flex h-[22px] w-[22px] -translate-x-1/2 items-center justify-center rounded-full text-[11px] font-extrabold text-black shadow-lg"
									style={`background: ${color}; box-shadow: 0 0 12px rgba(${rgbInner}, 0.4);`}
								>
									{place}
								</div>
							</div>
						</div>

						<div class="mt-4 flex flex-col items-center gap-1.5 px-3 text-center">
							<p class="text-[14px] font-semibold text-white max-sm:text-[12px]">{user.username}</p>
							<p
								class="font-['Source_Code_Pro',monospace] text-[10px] font-semibold tracking-[2px] text-[#4b5063] uppercase"
							>
								WAGERED
							</p>
							<p
								class="flex items-center gap-1 text-[15px] font-bold text-white/70 max-sm:text-[13px]"
							>
								{#if leaderboardEntry?.wageredDetails?.shouldShowIcon}
									{#if hasIcon}
										<img
											src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
											alt="currency"
											width="14"
											height="14"
											onerror={() => (hasIcon = false)}
										/>
									{:else}
										$
									{/if}
								{:else if leaderboardEntry?.wageredDetails?.wagerName}
									<span class="text-[11px] text-[#6b7280]"
										>{leaderboardEntry.wageredDetails.wagerName}</span
									>
								{/if}
								{renderCurrency(user.totalWagered)}
							</p>

							{#if prize > 0}
								<div
									class="mt-2 flex items-center gap-1 rounded-full px-3.5 py-1 text-[13px] font-bold"
									style={`background: rgba(${rgbInner}, 0.08); color: ${color}; border: 1px solid rgba(${rgbInner}, 0.15);`}
								>
									{#if hasIcon}
										<img
											src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
											alt="currency"
											width="12"
											height="12"
											onerror={() => (hasIcon = false)}
										/>
									{:else}
										$
									{/if}
									{renderCurrency(prize, 0)}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Countdown — between podium and table -->
		{#if secondsLeft > 0 && !previous}
			<div class="entrance mt-10 flex flex-col items-center gap-2.5" style="--d:400ms">
				<p
					class="font-['Source_Code_Pro',monospace] text-[11px] font-semibold tracking-[3px] text-[#4b5063] uppercase"
				>
					Ends in
				</p>
				<Countdown seconds={secondsLeft} />
			</div>
		{/if}

		<!-- Table -->
		<div class="entrance mt-10" style="--d:500ms">
			<!-- Table header -->
			<div
				class="mb-3 grid grid-cols-12 items-center px-5 py-2 text-[11px] font-semibold tracking-[2px] text-[#4b5063] uppercase max-sm:hidden"
			>
				<div class="col-span-1">#</div>
				<div class="col-span-5">User</div>
				<div class="col-span-3 text-right">Wagered</div>
				<div class="col-span-3 text-right">Prize</div>
			</div>

			<div class="flex flex-col gap-[5px]">
				{#each (leaderboardDate?.entries ?? []).slice(0, tableRowCount) as user, i}
					{@const place = i + 1}
					{@const prize = getPrize(place)}
					<div
						transition:fade={{ delay: Math.min(i * 50, 500), duration: 300 }}
						class={clsx(
							'grid grid-cols-12 items-center rounded-xl px-5 py-3 transition-all duration-200 max-sm:flex max-sm:flex-wrap max-sm:gap-2',
							place <= 3
								? 'border border-[#2a2d35] bg-[#161820]'
								: 'border border-transparent bg-[#111318]/50 hover:border-[#2a2d35] hover:bg-[#161820]'
						)}
					>
						<!-- Place -->
						<div class="col-span-1 max-sm:w-8">
							{#if place <= 3}
								<span class="text-[15px] font-bold" style={`color: ${placeColors[place - 1]};`}
									>{place}</span
								>
							{:else}
								<span class="text-[13px] font-medium text-[#6b7280]">{place}</span>
							{/if}
						</div>

						<!-- User -->
						<div class="col-span-5 flex items-center gap-3 max-sm:flex-1">
							<img
								alt={user.username}
								loading="lazy"
								width="30"
								height="30"
								src={user.avatar}
								class={clsx(
									'rounded-full',
									place <= 3 && 'ring-1',
									place === 1 && 'ring-[rgb(255,215,0)]/30',
									place === 2 && 'ring-[rgb(192,192,192)]/30',
									place === 3 && 'ring-[rgb(205,127,50)]/30'
								)}
							/>
							<span
								class={clsx('text-[13px] font-medium', place <= 3 ? 'text-white' : 'text-white/60')}
								>{user.username}</span
							>
						</div>

						<!-- Wagered -->
						<div
							class="col-span-3 flex items-center justify-end gap-1 text-[13px] font-medium text-[#8b8fa3] max-sm:w-full max-sm:justify-between"
						>
							<span class="hidden text-[10px] tracking-wider text-[#4b5063] uppercase max-sm:block"
								>Wagered</span
							>
							<span class="flex items-center gap-1">
								{#if leaderboardEntry?.wageredDetails?.shouldShowIcon}
									{#if hasIcon}
										<img
											src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
											alt="currency"
											width="13"
											height="13"
											onerror={() => (hasIcon = false)}
										/>
									{:else}
										$
									{/if}
								{/if}
								{renderCurrency(user.totalWagered)}
							</span>
						</div>

						<!-- Prize -->
						<div
							class="col-span-3 flex items-center justify-end gap-1 text-[13px] font-semibold max-sm:w-full max-sm:justify-between"
						>
							<span class="hidden text-[10px] tracking-wider text-[#4b5063] uppercase max-sm:block"
								>Prize</span
							>
							{#if prize > 0}
								<span
									class="flex items-center gap-1"
									style={`color: ${place <= 3 ? placeColors[place - 1] : 'var(--primary-color)'};`}
								>
									{#if hasIcon}
										<img
											src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
											alt="currency"
											width="13"
											height="13"
											onerror={() => (hasIcon = false)}
										/>
									{:else}
										$
									{/if}
									{renderCurrency(prize, 0)}
								</span>
							{:else}
								<span class="text-[#3a3d4a]">-</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.skeleton-pulse {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.05) 25%,
			rgba(255, 255, 255, 0.09) 50%,
			rgba(255, 255, 255, 0.05) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 1.8s ease-in-out infinite;
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
