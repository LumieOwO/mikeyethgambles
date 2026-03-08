<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { fade, slide, fly } from 'svelte/transition';

	let { data }: { data: { bonuses: any[]; knownCasinos: string[] } } = $props();

	let selectedCasino = $state('');
	let codeOrLink = $state('');
	let mainBonus = $state('');
	let extraBonus = $state('');
	let casinoOpen = $state(false);
	let copiedId: string | null = $state(null);

	// Editing state
	let editingId: string | null = $state(null);
	let editCasino = $state('');
	let editCode = $state('');
	let editHref = $state('');
	let editMainBonus = $state('');
	let editExtraBonus = $state('');

	function startEdit(bonus: any) {
		editingId = bonus.id;
		editCasino = bonus.casino;
		editCode = bonus.code;
		editHref = bonus.href;
		editMainBonus = bonus.mainBonus;
		editExtraBonus = bonus.extraBonus;
	}

	function cancelEdit() {
		editingId = null;
	}

	function copyCode(id: string, code: string) {
		navigator.clipboard.writeText(code);
		copiedId = id;
		setTimeout(() => (copiedId = null), 1500);
	}

	const canSubmit = $derived(selectedCasino && codeOrLink);
</script>

<div class="mx-auto max-w-4xl space-y-8">
	<!-- Header -->
	<div in:fly={{ y: -10, duration: 300 }}>
		<h1 class="mb-1 text-2xl font-bold text-white">Bonuses</h1>
		<p class="text-sm text-white/50">
			Manage bonuses displayed on your affiliate site. Customize the bonus text for each casino.
		</p>
	</div>

	<!-- Add New Bonus -->
	<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Header>
				<Card.Title class="text-white">Add New Bonus</Card.Title>
				<Card.Description class="text-white/40">
					Enter your affiliate code or paste a referral link. Optionally customize the bonus text.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/create"
					class="space-y-5"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							selectedCasino = '';
							codeOrLink = '';
							mainBonus = '';
							extraBonus = '';
						};
					}}
				>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<!-- Casino Selector -->
						<div class="space-y-2">
							<Label class="text-white/60">Casino</Label>
							<div class="relative">
								<button
									type="button"
									class="flex w-full items-center justify-between rounded-md border border-white/[0.08] bg-transparent px-3 py-2.5 text-sm transition-colors hover:border-white/15 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
									onclick={() => (casinoOpen = !casinoOpen)}
								>
									<span class={selectedCasino ? 'text-white' : 'text-white/30'}>
										{selectedCasino || 'Select a casino'}
									</span>
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class="text-white/30 transition-transform duration-200"
										class:rotate-180={casinoOpen}
									>
										<polyline points="6 9 12 15 18 9"></polyline>
									</svg>
								</button>
								{#if casinoOpen}
									<div
										transition:slide={{ duration: 150 }}
										class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#12121a] shadow-2xl"
									>
										{#each data.knownCasinos as casino, i}
											<button
												type="button"
												class="flex w-full items-center px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
												onclick={() => {
													selectedCasino = casino;
													casinoOpen = false;
												}}
											>
												{casino}
											</button>
										{/each}
									</div>
								{/if}
							</div>
							<input type="hidden" name="casino" value={selectedCasino} />
						</div>

						<!-- Code or Link -->
						<div class="space-y-2">
							<Label class="text-white/60">Affiliate Code or Link</Label>
							<Input
								class="border-white/[0.08] bg-transparent text-white placeholder:text-white/25 hover:border-white/15 focus:border-white/20 focus:ring-1 focus:ring-white/10"
								placeholder="e.g. MYCODE or stake.com/?c=MYCODE"
								name="codeOrLink"
								bind:value={codeOrLink}
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label class="text-white/60">Custom Main Bonus <span class="text-white/20">(optional)</span></Label>
							<Input
								class="border-white/[0.08] bg-transparent text-white placeholder:text-white/25 hover:border-white/15 focus:border-white/20 focus:ring-1 focus:ring-white/10"
								placeholder="e.g. 5% Deposit Bonus"
								name="mainBonus"
								bind:value={mainBonus}
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-white/60">Custom Extra Bonus <span class="text-white/20">(optional)</span></Label>
							<Input
								class="border-white/[0.08] bg-transparent text-white placeholder:text-white/25 hover:border-white/15 focus:border-white/20 focus:ring-1 focus:ring-white/10"
								placeholder="e.g. Free Spins"
								name="extraBonus"
								bind:value={extraBonus}
							/>
						</div>
					</div>

					<Separator class="bg-white/[0.04]" />

					<div class="flex justify-end">
						<Button
							type="submit"
							disabled={!canSubmit}
							class="gap-2 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
							</svg>
							Add Bonus
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Existing Bonuses -->
	<div class="space-y-4" in:fly={{ y: 10, duration: 300, delay: 200 }}>
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-white">Your Bonuses</h2>
			<span class="text-xs text-white/30">
				{data.bonuses.length} bonus{data.bonuses.length !== 1 ? 'es' : ''} total
			</span>
		</div>

		{#if data.bonuses.length === 0}
			<Card.Root class="border-dashed border-white/[0.06] bg-transparent">
				<Card.Content class="flex flex-col items-center gap-3 py-14">
					<svg class="h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
					</svg>
					<p class="text-sm text-white/25">No bonuses yet. Add your first one above.</p>
				</Card.Content>
			</Card.Root>
		{/if}

		<div class="space-y-2">
			{#each data.bonuses as bonus, idx (bonus.id)}
				<div
					in:fly={{ y: 8, duration: 250, delay: idx * 50 }}
					out:fade={{ duration: 150 }}
				>
					<Card.Root class="border-white/[0.06] bg-white/[0.02] transition-colors hover:bg-white/[0.035]">
						{#if editingId === bonus.id}
							<!-- Edit mode -->
							<div transition:slide={{ duration: 200 }}>
								<Card.Content class="pt-5">
									<form
										method="POST"
										action="?/update"
										class="space-y-4"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												editingId = null;
											};
										}}
									>
										<input type="hidden" name="id" value={bonus.id} />
										<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
											<div class="space-y-1.5">
												<Label class="text-xs text-white/50">Casino</Label>
												<Input
													class="border-white/[0.08] bg-transparent text-sm text-white hover:border-white/15"
													name="casino"
													bind:value={editCasino}
												/>
											</div>
											<div class="space-y-1.5">
												<Label class="text-xs text-white/50">Code</Label>
												<Input
													class="border-white/[0.08] bg-transparent text-sm text-white hover:border-white/15"
													name="code"
													bind:value={editCode}
												/>
											</div>
										</div>
										<div class="space-y-1.5">
											<Label class="text-xs text-white/50">Link</Label>
											<Input
												class="border-white/[0.08] bg-transparent text-sm text-white hover:border-white/15"
												name="href"
												bind:value={editHref}
											/>
										</div>
										<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
											<div class="space-y-1.5">
												<Label class="text-xs text-white/50">Main Bonus</Label>
												<Input
													class="border-white/[0.08] bg-transparent text-sm text-white hover:border-white/15"
													name="mainBonus"
													bind:value={editMainBonus}
												/>
											</div>
											<div class="space-y-1.5">
												<Label class="text-xs text-white/50">Extra Bonus</Label>
												<Input
													class="border-white/[0.08] bg-transparent text-sm text-white hover:border-white/15"
													name="extraBonus"
													bind:value={editExtraBonus}
												/>
											</div>
										</div>
										<Separator class="bg-white/[0.04]" />
										<div class="flex justify-end gap-2">
											<Button variant="ghost" class="text-white/40 hover:text-white/70" onclick={cancelEdit}>
												Cancel
											</Button>
											<Button type="submit" class="bg-blue-600 text-white hover:bg-blue-500">
												Save Changes
											</Button>
										</div>
									</form>
								</Card.Content>
							</div>
						{:else}
							<!-- View mode -->
							<div class="flex items-center justify-between gap-4 px-4 py-3">
								<div class="flex min-w-0 flex-1 items-center gap-3.5">
									{#if bonus.logoUrl}
										<img
											alt={bonus.casino}
											width="36"
											height="36"
											class="flex-shrink-0 rounded-lg object-contain"
											src={bonus.logoUrl}
										/>
									{:else}
										<div
											class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white/60"
										>
											{bonus.casino.charAt(0)}
										</div>
									{/if}

									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-1.5">
											<span class="text-sm font-semibold text-white">{bonus.casino}</span>
											{#if bonus.mainBonus}
												<Badge variant="outline" class="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">
													{bonus.mainBonus}
												</Badge>
											{/if}
											{#if bonus.extraBonus}
												<Badge variant="outline" class="border-blue-500/20 bg-blue-500/10 text-[10px] text-blue-400">
													{bonus.extraBonus}
												</Badge>
											{/if}
										</div>
										<div class="mt-0.5 flex items-center gap-1.5">
											<span class="text-[11px] text-white/30">Code:</span>
											<span
												class="font-mono text-xs font-semibold uppercase"
												style={`color: ${bonus.color};`}
											>
												{bonus.code}
											</span>
										</div>
									</div>
								</div>

								<div class="flex flex-shrink-0 items-center">
									<!-- Copy -->
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-white/25 hover:text-white/70"
										onclick={() => copyCode(bonus.id, bonus.code)}
									>
										{#if copiedId === bonus.id}
											<svg class="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
											</svg>
										{:else}
											<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
											</svg>
										{/if}
									</Button>
									<!-- Edit -->
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-white/25 hover:text-blue-400"
										onclick={() => startEdit(bonus)}
									>
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
										</svg>
									</Button>
									<!-- Delete -->
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={bonus.id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="h-8 w-8 text-white/25 hover:text-red-400"
										>
											<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
											</svg>
										</Button>
									</form>
								</div>
							</div>
						{/if}
					</Card.Root>
				</div>
			{/each}
		</div>
	</div>
</div>
