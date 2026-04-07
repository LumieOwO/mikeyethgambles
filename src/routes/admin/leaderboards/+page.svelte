<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils';

	interface LeaderboardRow {
		id: string;
		siteName: string;
		site: string;
		startDate: string;
		endDate: string;
		totalPrizePool: number;
		prizes: Record<number, number>;
		status: 'active' | 'ended' | 'completed';
		source: 'config' | 'admin';
		apiKey?: string;
		code?: string;
		wagerName?: string;
		shouldShowIcon?: boolean;
		winnersExist: boolean;
	}

	let { data, form }: {
		data: { leaderboards: LeaderboardRow[]; availableSites: string[] };
		form: { success?: boolean; error?: string; created?: string; deleted?: string; snapshotted?: string; count?: number } | null;
	} = $props();

	let showCreate = $state(false);
	let showSuccess = $state(false);

	$effect(() => {
		if (form?.success) {
			showSuccess = true;
			showCreate = false;
			const t = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(t);
		}
	});

	const statusColors: Record<string, string> = {
		active: 'bg-emerald-500/10 text-emerald-400',
		ended: 'bg-amber-500/10 text-amber-400',
		completed: 'bg-blue-500/10 text-blue-400',
	};

	function formatDate(iso: string): string {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white">Leaderboards</h1>
			<p class="text-sm text-white/40">{data.leaderboards.length} leaderboards total</p>
		</div>
		<button
			onclick={() => (showCreate = !showCreate)}
			class="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
		>
			{showCreate ? 'Cancel' : '+ Create Leaderboard'}
		</button>
	</div>

	{#if showSuccess}
		<div class="mb-6 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
			{#if form?.created}
				Leaderboard created successfully.
			{:else if form?.deleted}
				Leaderboard deleted.
			{:else if form?.snapshotted}
				Winners snapshot saved ({form.count} entries).
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<!-- Create Form -->
	{#if showCreate}
		<div class="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
			<h2 class="mb-4 text-lg font-semibold text-white">Create New Leaderboard</h2>

			<form method="POST" action="?/create" use:enhance class="grid grid-cols-2 gap-4">
				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="site">Site Integration</label>
					<select
						id="site"
						name="site"
						required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
					>
						{#each data.availableSites as site}
							<option value={site} class="bg-[#1a1a2e]">{site}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="code">Referral Code</label>
					<input
						id="code"
						name="code"
						type="text"
						value="Mikey"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
					/>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="startDate">Start Date</label>
					<input
						id="startDate"
						name="startDate"
						type="datetime-local"
						required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
					/>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="endDate">End Date</label>
					<input
						id="endDate"
						name="endDate"
						type="datetime-local"
						required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
					/>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="apiKey">API Key</label>
					<input
						id="apiKey"
						name="apiKey"
						type="text"
						required
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
						placeholder="Enter API key"
					/>
				</div>

				<div>
					<label class="mb-1 block text-xs font-medium text-white/50" for="wagerName">Wager Label</label>
					<div class="flex gap-3">
						<input
							id="wagerName"
							name="wagerName"
							type="text"
							value="Wagered"
							class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
						/>
						<label class="flex items-center gap-2 text-xs text-white/50">
							<input type="checkbox" name="shouldShowIcon" checked class="accent-emerald-500" />
							Icon
						</label>
					</div>
				</div>

				<!-- Prizes -->
				<div class="col-span-2">
					<label class="mb-2 block text-xs font-medium text-white/50">Prizes (by place)</label>
					<div class="grid grid-cols-5 gap-2">
						{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as place}
							<div>
								<label class="mb-0.5 block text-xs text-white/30">#{place}</label>
								<input
									name="prize_{place}"
									type="number"
									min="0"
									value="0"
									class="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-white/30"
								/>
							</div>
						{/each}
					</div>
				</div>

				<div class="col-span-2 flex justify-end">
					<button
						type="submit"
						class="rounded-lg bg-emerald-500/20 px-6 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/30"
					>
						Create Leaderboard
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Leaderboard List -->
	<div class="flex flex-col gap-3">
		{#each data.leaderboards as lb}
			<div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
				<div class="flex items-center gap-4">
					<div>
						<div class="flex items-center gap-2">
							<h3 class="text-base font-semibold text-white">{lb.siteName}</h3>
							<span class="rounded-full px-2.5 py-0.5 text-xs font-medium {statusColors[lb.status]}">
								{lb.status}
							</span>
							{#if lb.source === 'config'}
								<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30">config</span>
							{/if}
						</div>
						<p class="mt-1 text-xs text-white/40">
							{formatDate(lb.startDate)} — {formatDate(lb.endDate)}
							{#if lb.totalPrizePool > 0}
								&middot; Prize pool: ${formatCurrency(lb.totalPrizePool, 0)}
							{/if}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<a
						href="/admin/leaderboards/{lb.id}"
						class="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/10"
					>
						{lb.winnersExist ? 'View Winners' : 'Edit'}
					</a>

					<form method="POST" action="?/snapshot" use:enhance class="inline">
						<input type="hidden" name="id" value={lb.id} />
						<button
							type="submit"
							class="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20"
							title="Snapshot current winners"
						>
							Snapshot
						</button>
					</form>

					{#if lb.source === 'admin'}
						<form method="POST" action="?/delete" use:enhance class="inline">
							<input type="hidden" name="id" value={lb.id} />
							<button
								type="submit"
								class="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
								onclick={(e) => { if (!confirm('Delete this leaderboard?')) e.preventDefault(); }}
							>
								Delete
							</button>
						</form>
					{/if}
				</div>
			</div>
		{:else}
			<div class="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-12 text-center text-sm text-white/30">
				No leaderboards yet. Create one above.
			</div>
		{/each}
	</div>
</div>
