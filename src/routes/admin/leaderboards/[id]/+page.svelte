<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils';
	import type { ILeaderboardEntry } from '$lib/types';

	let { data, form }: {
		data: {
			leaderboard: {
				id: string;
				siteName: string;
				site: string;
				startDate: string;
				endDate: string;
				apiKey: string;
				code: string;
				prizes: Record<number, number>;
				wagerName: string;
				shouldShowIcon: boolean;
				source: 'config' | 'admin';
			};
			winners: ILeaderboardEntry[];
			availableSites: string[];
		};
		form: { success?: boolean; error?: string; snapshotCount?: number } | null;
	} = $props();

	const lb = data.leaderboard;

	function toDatetimeLocal(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toISOString().slice(0, 16);
	}

	let showSuccess = $state(false);

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			const t = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(t);
		}
	});
</script>

<div class="mx-auto max-w-3xl">
	<div class="mb-6 flex items-center gap-4">
		<a href="/admin/leaderboards" class="text-white/40 transition hover:text-white/60">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<div>
			<h1 class="text-2xl font-bold text-white">{lb.siteName}</h1>
			<p class="text-sm text-white/40">
				{lb.source === 'config' ? 'Defined in code config' : 'Admin-created'} &middot; ID: {lb.id}
			</p>
		</div>
	</div>

	{#if showSuccess}
		<div class="mb-6 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
			{form?.snapshotCount ? `Winners snapshot saved (${form.snapshotCount} entries).` : 'Leaderboard updated.'}
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<!-- Edit Form (only for admin-created leaderboards) -->
	{#if lb.source === 'admin'}
		<div class="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
			<h2 class="mb-4 text-lg font-semibold text-white">Edit Leaderboard</h2>

			<form method="POST" action="?/update" use:enhance class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="site">Site</label>
					<select
						id="site"
						name="site"
						required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
					>
						{#each data.availableSites as site}
							<option value={site} selected={site === lb.site} class="bg-[#1a1a2e]">{site}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="code">Code</label>
					<input id="code" name="code" type="text" value={lb.code}
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="startDate">Start</label>
					<input id="startDate" name="startDate" type="datetime-local" value={toDatetimeLocal(lb.startDate)} required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="endDate">End</label>
					<input id="endDate" name="endDate" type="datetime-local" value={toDatetimeLocal(lb.endDate)} required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="apiKey">API Key</label>
					<input id="apiKey" name="apiKey" type="text" value={lb.apiKey} required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="wagerName">Wager Label</label>
					<div class="flex gap-3">
						<input id="wagerName" name="wagerName" type="text" value={lb.wagerName}
							class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
						<label class="flex items-center gap-2 text-xs text-white/50">
							<input type="checkbox" name="shouldShowIcon" checked={lb.shouldShowIcon} class="accent-emerald-500" />
							Icon
						</label>
					</div>
				</div>

				<div class="col-span-2">
					<label class="mb-2 block text-xs font-medium text-white/50">Prizes</label>
					<div class="grid grid-cols-5 gap-2">
						{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as place}
							<div>
								<label class="mb-0.5 block text-xs text-white/30">#{place}</label>
								<input
									name="prize_{place}"
									type="number"
									min="0"
									value={lb.prizes[place] || 0}
									class="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-white/30"
								/>
							</div>
						{/each}
					</div>
				</div>

				<div class="col-span-2 flex justify-end">
					<button type="submit"
						class="rounded-lg bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
						Save Changes
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
			<h2 class="mb-3 text-lg font-semibold text-white">Leaderboard Details</h2>
			<p class="mb-1 text-sm text-white/50">This leaderboard is defined in code. Edit <code class="text-white/70">creators.ts</code> to change it.</p>
			<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
				<div><span class="text-white/40">Start:</span> <span class="text-white">{new Date(lb.startDate).toLocaleString()}</span></div>
				<div><span class="text-white/40">End:</span> <span class="text-white">{new Date(lb.endDate).toLocaleString()}</span></div>
				<div><span class="text-white/40">Code:</span> <span class="text-white">{lb.code}</span></div>
				<div><span class="text-white/40">Wager:</span> <span class="text-white">{lb.wagerName}</span></div>
			</div>
			{#if Object.keys(lb.prizes).length > 0}
				<div class="mt-3 text-sm">
					<span class="text-white/40">Prizes:</span>
					{#each Object.entries(lb.prizes) as [place, amount]}
						<span class="ml-2 text-white">#{place}: ${formatCurrency(Number(amount), 0)}</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Snapshot Winners -->
	<div class="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-white">Winners</h2>
			<form method="POST" action="?/snapshot" use:enhance class="inline">
				<button type="submit"
					class="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20">
					{data.winners.length > 0 ? 'Re-snapshot' : 'Snapshot Winners'}
				</button>
			</form>
		</div>

		{#if data.winners.length > 0}
			<div class="overflow-hidden rounded-lg border border-white/10">
				<table class="w-full">
					<thead>
						<tr class="border-b border-white/10">
							<th class="px-4 py-2 text-left text-xs font-semibold uppercase text-white/40">Place</th>
							<th class="px-4 py-2 text-left text-xs font-semibold uppercase text-white/40">User</th>
							<th class="px-4 py-2 text-left text-xs font-semibold uppercase text-white/40">Wagered</th>
							<th class="px-4 py-2 text-left text-xs font-semibold uppercase text-white/40">Prize</th>
						</tr>
					</thead>
					<tbody>
						{#each data.winners.slice(0, 10) as winner, i}
							<tr class="border-b border-white/5">
								<td class="px-4 py-2 text-sm font-semibold {i < 3 ? 'text-amber-400' : 'text-white/50'}">#{i + 1}</td>
								<td class="px-4 py-2">
									<div class="flex items-center gap-2">
										<img src={winner.avatar} alt="" class="h-6 w-6 rounded" loading="lazy" />
										<span class="text-sm text-white">{winner.username}</span>
									</div>
								</td>
								<td class="px-4 py-2 text-sm text-emerald-400">${formatCurrency(winner.totalWagered)}</td>
								<td class="px-4 py-2 text-sm text-amber-400">
									{#if lb.prizes[i + 1]}
										${formatCurrency(lb.prizes[i + 1], 0)}
									{:else}
										—
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-sm text-white/30">No winners snapshot yet. Click "Snapshot Winners" to save the current standings.</p>
		{/if}
	</div>
</div>
