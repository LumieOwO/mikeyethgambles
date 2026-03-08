<script lang="ts">
	import clsx from 'clsx';
	import type { Icreator, ILeaderboardEntry } from '$lib/server/data/types';
	import { formatCurrency, normalizeSiteName } from '$lib/utils';
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/leaderboard/sidebar.svelte';
	import RadialGlow from '$lib/components/leaderboard/radial-glow.svelte';
	import tinycolor from 'tinycolor2';
	import Countdown from '$lib/components/countdown.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { CdnUrl } from '$lib/data/config';
	import NumberFlow from '@number-flow/svelte';

	let { data }: { data: { creator: Icreator; sub: string }; children: any } = $props();

	let previous = $state(false); // track previous/current

	// derived values
	let hasIcon = $state(true);
	let siteName = $state($page.params.siteName);
	let normalizedParam = $derived(normalizeSiteName(siteName));
	$effect(() => {
		siteName = $page.params.siteName;
		console.log(siteName);
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
	let topThreeAccentColors = ['#9d9c9c', '#ffdb2c', '#FB935C'];

	// derived leaderboard entry
	let leaderboardEntry = $derived(
		data.creator.websiteLeaderboards.find(
			(entry) => normalizeSiteName(entry.siteName) === normalizedParam
		)
	);

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

	// run once on mount
	onMount(() => {
		fetchLeaderboard();
		const interval = setInterval(() => fetchLeaderboard(), 60 * 60 * 1000);
		return () => clearInterval(interval);
	});

	// re-fetch whenever normalizedParam changes
	$effect(() => {
		if (normalizedParam) {
			// reset state before fetching
			leaderboardDate = undefined;
			loading = true;
			secondsLeft = 0;
			hasIcon = true;
			fetchLeaderboard();
		}
	});
</script>

<div class="flex items-center justify-between">
	<div class="mx-auto my-0 mt-[60px] w-full max-w-[1200px] px-6 py-12">
		<header class="relative flex flex-col items-center">
			{#if data.creator.websiteLeaderboards?.length > 1}
				<div class="relative mb-[32px] w-full border-b border-secondary/5 px-2 sm:px-4 md:px-0">
					<div class="relative flex w-full items-center justify-center">
						{#each data.creator.websiteLeaderboards as lb, i}
							{#if lb.prizes}
								<a
									href={`/leaderboard/${normalizeSiteName(lb.siteName)}`}
									class={clsx(
										'relative flex h-24 cursor-pointer items-center py-3 transition-all duration-250 hover:scale-105 hover:opacity-100',
										normalizeSiteName(lb.siteName) === normalizedParam
											? 'active opacity-100'
											: 'opacity-50'
									)}
								>
									<img
										src={`/images/websites/logos/${normalizeSiteName(lb.siteName)}.png`}
										alt={lb.siteName}
										class="mx-auto block h-full w-full object-scale-down object-center"
									/>
								</a>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
			<div class="flex flex-col gap-3">
				<div
					class="flex items-center justify-center gap-2 text-center text-[42px] font-bold tracking-tight"
				>
					{#if hasIcon}
						<img
							src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
							alt="currency"
							width="30"
							height="30"
							class="drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
							onerror={() => (hasIcon = false)}
						/>
					{:else}
						<span class="text-white/90">$</span>
					{/if}

					<span
						class="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
					>
						<NumberFlow
							class="
    bg-gradient-to-r from-white via-cyan-300 to-fuchsia-300
    bg-clip-text text-transparent
	text-white
    drop-shadow-[0_0_2000px_rgb(0,255,0)]
    drop-shadow-[0_0_2000px_rgb(0,255,255)]
    drop-shadow-[0_0_2000px_rgb(255,0,255)]
    filter
  "
							value={Object.values(leaderboardEntry?.prizes ?? 0).reduce(
								(sum, val) => sum + val,
								0
							)}
						/>
						Weekly Leaderboard
					</span>
				</div>

				<div class="text-center text-[17px] leading-relaxed text-white/55">
					{#if siteName.replace('-', '.') != 'goldpump.com'}
						Every BET on
						<span class="font-medium text-white/80">{siteName.replace('-', '.')}</span>
						counts toward your score.<br />
						Updates every 15 minutes.
					{:else}
						Every BET on
						<span class="font-medium text-white/80">{siteName.replace('-', '.')}</span>
						counts toward your score.<br />
						Updated manually every 24 hours.
					{/if}
<br />
{#if siteName.replace('-', '.') == 'shock.com'}
We reserve the right to remove or restrict any accounts found to be abusing wagers.<br />
If an account is found farming wagers through house games, those wagers will be removed.
{/if}
				</div>
			</div>
		</header>
		<div class="mt-4 flex justify-center">
			<button
				class="rounded bg-gray-800 px-4 py-2 font-semibold text-white transition hover:bg-gray-700"
				onclick={() => (previous = !previous)}
			>
				{previous ? 'Previous Leaderboard' : 'Current Leaderboard'}
			</button>
		</div>
		<div class="mb-12 flex flex-row justify-center">
			<img
				alt="penguin"
				width="555"
				height="667"
				src={`/images/home/penguin.png`}
				class="max-h-[667px] scale-x-[-1] select-none max-[1825px]:hidden"
			/>
			<div
				class="relative mt-[30px] flex w-full justify-center gap-6 px-12 max-[825px]:[grid-template-columns:1fr] max-[825px]:flex-col"
			>
				{#each [...(leaderboardDate?.entries ?? [])]
					.sort((a, b) => b.totalWagered - a.totalWagered)
					.slice(0, 3)
					.map( (user, i, arr) => ({ ...[arr[2], arr[0], arr[1]][i], prize: leaderboardEntry?.prizes?.[[3, 1, 2][i]] }) ) ?? [] as user, i}
					<div
						transition:fade={{ delay: i * 100, duration: 400 }}
						class="flex h-full flex-col items-center justify-end gap-4 px-6 py-8"
						style="--accent: {topThreeAccentColors[i]};"
					>
						<img
							alt="{user.username} avatar"
							loading="lazy"
							width="100"
							height="100"
							decoding="async"
							src={user.avatar}
							class="rounded-[14px]"
							style="color: transparent;"
						/>
						<div class="flex flex-col items-center gap-3">
							<div class="flex flex-col items-center gap-1 text-[#ededed]">
								<h3
									class="font-['Source_Code_Pro',monospace] text-[20.7px] leading-[100%] font-semibold tracking-[0%] text-white uppercase [leading-trim:NONE]"
									style="-webkit-text-stroke: 2px rgba(255, 255, 255, 0.5); /* outline color */
	       text-stroke: 1.2px rgba(255, 255, 255, 0.5);"
								>
									{user.username}
								</h3>

								<div
									class="flex items-center font-['Source_Code_Pro',monospace] text-[20.7px] leading-[100%] font-semibold tracking-[0%] text-[#777777] uppercase [leading-trim:NONE]"
									style="-webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.5); text-stroke: 1.2px rgba(255, 255, 255, 0.5);"
								>
									{#if leaderboardEntry.wageredDetails.shouldShowIcon}
										{#if hasIcon}
											<img
												src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
												alt="currency"
												width="18"
												height="17"
												onerror={() => (hasIcon = false)}
											/>
										{:else}
											$
										{/if}
										<span class="ml-[2px]">{formatCurrency(user.totalWagered)}</span>
									{:else}
										<span>{leaderboardEntry.wageredDetails.wagerName}</span>
										<span class="ml-[2px]">{formatCurrency(user.totalWagered)}</span>
									{/if}
								</div>

								<div
									class="flex items-center gap-2 font-['Source_Code_Pro',monospace] text-[20.7px] leading-[100%] font-semibold tracking-[0%] text-white uppercase [leading-trim:NONE]"
									style="-webkit-text-stroke: 2px rgba(255, 255, 255, 0.5); /* outline color */
	       text-stroke: 1.2px rgba(255, 255, 255, 0.5);"
								>
									{#if hasIcon}
										<img
											src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
											alt="currency"
											width="16"
											height="16"
											onerror={() => (hasIcon = false)}
										/>
									{:else}
										$
									{/if}
									{formatCurrency(
										 (user.prize ?? 0),
										0
									)}
								</div>
							</div>
						</div>

						<!-- podium at the bottom -->
						<img
							src={`/images/leaderboard/podium/${i}.svg`}
							alt="podium"
							class="w-auto max-w-[140px]"
						/>
					</div>
				{/each}
			</div>
			<img
				alt="penguin"
				width="555"
				height="667"
				class="max-h-[667px] select-none max-[1825px]:hidden"
				src="/images/home/penguin.png"
			/>
		</div>
		<div class="flex w-full flex-col gap-[26px] px-[15px]">
			<div class="flex justify-between px-12">
				<div class="text-[21px] font-semibold">Other positions</div>
				<div
					class="flex items-center justify-center gap-3 text-center text-[21px] font-semibold text-[#777777]"
				>
					Ends in <Countdown seconds={secondsLeft} />
				</div>
			</div>
			{#each leaderboardDate?.entries.slice(3, 10) ?? [] as user, i}
				<div
					class="relative grid h-[106px] w-full grid-cols-4 grid-rows-2 items-center justify-center justify-items-center rounded-[12px]
         bg-[#060811] px-5 py-4"
				>
					<div
						class="[font-family:Source_Code_Pro] text-[18px] leading-[100%] font-semibold tracking-[0%] text-[#777777] uppercase [font-style:SemiBold] [leading-trim:NONE]"
					>
						PLACE
					</div>
					<div
						class="[font-family:Source_Code_Pro] text-[18px] leading-[100%] font-semibold tracking-[0%] text-[#777777] uppercase [font-style:SemiBold] [leading-trim:NONE]"
					>
						USER
					</div>
					<div
						class="[font-family:Source_Code_Pro] text-[18px] leading-[100%] font-semibold tracking-[0%] text-[#777777] uppercase [font-style:SemiBold] [leading-trim:NONE]"
					>
						REWARD
					</div>
					<div
						class="[font-family:Source_Code_Pro] text-[18px] leading-[100%] font-semibold tracking-[0%] text-[#777777] uppercase [font-style:SemiBold] [leading-trim:NONE]"
					>
						{leaderboardEntry.wageredDetails.wagerName}
					</div>
					#{i + 4}
					<div class="flex flex-row-reverse gap-2">
						{user.username}
						<img
							alt="{user.username} avatar"
							loading="lazy"
							width="20"
							height="20"
							decoding="async"
							data-nimg="1"
							class="rounded-[5px]"
							src={user.avatar}
						/>
					</div>
					{#if leaderboardEntry && leaderboardEntry.prizes}<span
							class=" flex flex-nowrap items-center justify-center gap-1.5 rounded-[999px] font-extrabold tracking-[1px] text-nowrap whitespace-nowrap text-[#ffdb2c]"
						>
							{#if hasIcon}
								<img
									src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
									alt="currency"
									width="18"
									height="17"
									class="inline-block"
									onerror={() => (hasIcon = false)}
								/>
							{:else}
								$
							{/if}
							{formatCurrency(leaderboardEntry?.prizes[i + 4] ?? 0, 0)}
						</span>{/if}
					<p
						class=" flex items-center justify-center gap-1.5 tracking-[1px] text-nowrap text-[#8EFF80]"
					>
						+{#if leaderboardEntry.wageredDetails.shouldShowIcon}
							{#if hasIcon}
								<img
									src={`/images/websites/currencies/${normalizeSiteName(siteName)}.svg`}
									alt="currency"
									class="mb-[2px]"
									width="18"
									height="17"
									onerror={() => (hasIcon = false)}
								/>
							{:else}
								$
							{/if}
						{/if}{formatCurrency(user.totalWagered)}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
