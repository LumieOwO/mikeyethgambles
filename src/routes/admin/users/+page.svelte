<script lang="ts">
	import { formatCurrency } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { fly, fade } from 'svelte/transition';

	let { data }: {
		data: {
			users: {
				username: string;
				avatar: string;
				totalWagered: number;
				totalWageredUsd: number;
				siteName: string;
				leaderboardId: string;
			}[];
			siteStats: { siteName: string; userCount: number; totalWagered: number; totalWageredUsd: number }[];
			totalWagered: number;
			avgWagered: number;
			topWagered: number;
		};
	} = $props();

	let search = $state('');
	let sortBy = $state<'totalWagered' | 'username'>('totalWagered');
	let sortDir = $state<'asc' | 'desc'>('desc');
	let currentPage = $state(1);
	let perPage = $state(25);
	let siteFilter = $state('');

	let filtered = $derived(
		data.users.filter((u) => {
			const matchesSearch = !search ||
				u.username.toLowerCase().includes(search.toLowerCase()) ||
				u.siteName.toLowerCase().includes(search.toLowerCase());
			const matchesSite = !siteFilter || u.siteName === siteFilter;
			return matchesSearch && matchesSite;
		})
	);

	let sorted = $derived(
		[...filtered].sort((a, b) => {
			const mul = sortDir === 'asc' ? 1 : -1;
			if (sortBy === 'totalWagered') return (a.totalWageredUsd - b.totalWageredUsd) * mul;
			return a.username.localeCompare(b.username) * mul;
		})
	);

	let totalPages = $derived(Math.max(1, Math.ceil(sorted.length / perPage)));
	let paged = $derived(sorted.slice((currentPage - 1) * perPage, currentPage * perPage));

	// Clamp currentPage when data changes
	$effect(() => {
		if (currentPage > totalPages) currentPage = totalPages;
	});

	function toggleSort(col: 'totalWagered' | 'username') {
		if (sortBy === col) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = col;
			sortDir = col === 'totalWagered' ? 'desc' : 'asc';
		}
		currentPage = 1;
	}

	function resetFilters() {
		search = '';
		siteFilter = '';
		currentPage = 1;
	}

	const pageNumbers = $derived.by(() => {
		const pages: (number | '...')[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push(1);
			if (currentPage > 3) pages.push('...');
			for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
				pages.push(i);
			}
			if (currentPage < totalPages - 2) pages.push('...');
			pages.push(totalPages);
		}
		return pages;
	});
</script>

<div class="mx-auto max-w-6xl space-y-8">
	<!-- Header -->
	<div in:fly={{ y: -10, duration: 300 }}>
		<h1 class="mb-1 text-2xl font-bold text-white">Users</h1>
		<p class="text-sm text-white/50">
			Track affiliate users across all leaderboards
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<!-- Total Users -->
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Content class="p-5">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
						<svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-white/40">Total Users</p>
						<p class="text-xl font-bold text-white">{data.users.length.toLocaleString()}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Total Wagered -->
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Content class="p-5">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
						<svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-white/40">Total Wagered</p>
						<p class="text-xl font-bold text-emerald-400">${formatCurrency(data.totalWagered, 0)}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Average Wagered -->
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Content class="p-5">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
						<svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-white/40">Avg Wagered</p>
						<p class="text-xl font-bold text-amber-400">${formatCurrency(data.avgWagered, 0)}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Top Wagered -->
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Content class="p-5">
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
						<svg class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
						</svg>
					</div>
					<div>
						<p class="text-xs font-medium text-white/40">Top Wagered</p>
						<p class="text-xl font-bold text-purple-400">${formatCurrency(data.topWagered, 0)}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Site Breakdown -->
	{#if data.siteStats.length > 1}
		<div in:fly={{ y: 10, duration: 300, delay: 150 }}>
			<Card.Root class="border-white/[0.06] bg-white/[0.025]">
				<Card.Header class="pb-3">
					<Card.Title class="text-sm text-white/60">By Site</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each data.siteStats as site}
							<button
								class="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-200
									{siteFilter === site.siteName
										? 'border-white/20 bg-white/[0.06]'
										: 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'}"
								onclick={() => {
									siteFilter = siteFilter === site.siteName ? '' : site.siteName;
									currentPage = 1;
								}}
							>
								<div>
									<p class="text-sm font-semibold text-white">{site.siteName}</p>
									<p class="text-xs text-white/30">{site.userCount} user{site.userCount !== 1 ? 's' : ''}</p>
								</div>
								<span class="text-sm font-bold text-emerald-400/80">${formatCurrency(site.totalWageredUsd, 0)}</span>
							</button>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Filters & Table -->
	<div class="space-y-4" in:fly={{ y: 10, duration: 300, delay: 200 }}>
		<div class="flex flex-wrap items-center gap-3">
			<div class="relative flex-1">
				<svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<Input
					class="border-white/[0.08] bg-transparent pl-10 text-white placeholder:text-white/25 hover:border-white/15 focus:border-white/20 focus:ring-1 focus:ring-white/10"
					placeholder="Search by username or site..."
					bind:value={search}
					oninput={() => (currentPage = 1)}
				/>
			</div>
			{#if siteFilter || search}
				<Button
					variant="ghost"
					class="text-white/40 hover:text-white/70"
					onclick={resetFilters}
				>
					Clear filters
				</Button>
			{/if}
			<div class="flex items-center gap-2">
				<span class="text-xs text-white/30">Per page:</span>
				{#each [25, 50, 100] as n}
					<button
						class="rounded-md px-2 py-1 text-xs transition-colors
							{perPage === n ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}"
						onclick={() => { perPage = n; currentPage = 1; }}
					>
						{n}
					</button>
				{/each}
			</div>
		</div>

		<!-- Table -->
		<Card.Root class="overflow-hidden border-white/[0.06] bg-white/[0.02]">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-white/[0.06]">
							<th class="px-4 py-3 text-left text-xs font-semibold uppercase text-white/30">#</th>
							<th
								class="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase text-white/30 transition-colors hover:text-white/60"
								onclick={() => toggleSort('username')}
							>
								<div class="flex items-center gap-1">
									User
									{#if sortBy === 'username'}
										<svg class="h-3 w-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											{#if sortDir === 'asc'}
												<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
											{:else}
												<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th
								class="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase text-white/30 transition-colors hover:text-white/60"
								onclick={() => toggleSort('totalWagered')}
							>
								<div class="flex items-center gap-1">
									Total Wagered
									{#if sortBy === 'totalWagered'}
										<svg class="h-3 w-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											{#if sortDir === 'asc'}
												<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
											{:else}
												<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th class="px-4 py-3 text-left text-xs font-semibold uppercase text-white/30">Site</th>
							<th class="px-4 py-3 text-right text-xs font-semibold uppercase text-white/30">Share</th>
						</tr>
					</thead>
					<tbody>
						{#each paged as user, i (user.username + user.siteName)}
							{@const rank = (currentPage - 1) * perPage + i + 1}
							{@const sharePercent = data.totalWagered > 0 ? (user.totalWageredUsd / data.totalWagered) * 100 : 0}
							<tr
								class="border-b border-white/[0.03] transition-colors hover:bg-white/[0.025]"
								in:fly={{ y: 4, duration: 150, delay: i * 20 }}
							>
								<td class="px-4 py-3">
									{#if rank <= 3}
										<span class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
											{rank === 1 ? 'bg-amber-500/15 text-amber-400' : rank === 2 ? 'bg-gray-400/15 text-gray-300' : 'bg-orange-500/15 text-orange-400'}">
											{rank}
										</span>
									{:else}
										<span class="text-sm text-white/30">{rank}</span>
									{/if}
								</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<img
											src={user.avatar}
											alt={user.username}
											class="h-8 w-8 rounded-lg"
											loading="lazy"
										/>
										<span class="text-sm font-medium text-white">{user.username}</span>
									</div>
								</td>
								<td class="px-4 py-3">
									<div>
										<span class="text-sm font-semibold text-emerald-400">
											${formatCurrency(user.totalWageredUsd)}
										</span>
										{#if user.totalWageredUsd !== user.totalWagered}
											<span class="ml-1.5 text-[11px] text-white/25">
												({formatCurrency(user.totalWagered, 0)} site)
											</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-3">
									<Badge variant="outline" class="border-white/[0.08] bg-white/[0.03] text-[11px] text-white/50">
										{user.siteName}
									</Badge>
								</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-2">
										<div class="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
											<div
												class="h-full rounded-full bg-emerald-500/40"
												style="width: {Math.min(sharePercent, 100)}%"
											></div>
										</div>
										<span class="min-w-[40px] text-right text-xs text-white/30">
											{sharePercent.toFixed(1)}%
										</span>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="px-4 py-14 text-center">
									<svg class="mx-auto mb-3 h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
									</svg>
									<p class="text-sm text-white/25">
										{search || siteFilter ? 'No users match your filters.' : 'No user data available yet.'}
									</p>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Root>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex items-center justify-between">
				<p class="text-xs text-white/30">
					Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, sorted.length)} of {sorted.length}
					{#if filtered.length !== data.users.length}
						<span class="text-white/20">(filtered from {data.users.length})</span>
					{/if}
				</p>
				<div class="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-white/30 hover:text-white/70 disabled:opacity-20"
						onclick={() => (currentPage = 1)}
						disabled={currentPage === 1}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
						</svg>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-white/30 hover:text-white/70 disabled:opacity-20"
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</Button>

					{#each pageNumbers as pg}
						{#if pg === '...'}
							<span class="px-1 text-xs text-white/20">...</span>
						{:else}
							<button
								class="flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors
									{currentPage === pg ? 'bg-white/10 text-white' : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'}"
								onclick={() => (currentPage = pg as number)}
							>
								{pg}
							</button>
						{/if}
					{/each}

					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-white/30 hover:text-white/70 disabled:opacity-20"
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-white/30 hover:text-white/70 disabled:opacity-20"
						onclick={() => (currentPage = totalPages)}
						disabled={currentPage === totalPages}
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
						</svg>
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
