<script lang="ts">
	let {
		logo,
		name,
		color,
		code,
		href,
		mainReward,
		rewardLines,
		onCopyCode
	}: {
		logo: string;
		name: string;
		color: string;
		code: string;
		href: string;
		mainReward: string;
		rewardLines: string[];
		onCopyCode: () => void;
	} = $props();

	let justCopied = $state(false);

	function handleCopy() {
		onCopyCode();
		justCopied = true;
		setTimeout(() => (justCopied = false), 2000);
	}
</script>

<div
	class="rounded-xl border p-6"
	style="background-color: rgb(26, 22, 18); border-color: rgba(255, 255, 255, 0.08);"
>
	<!-- Logo -->
	{#if logo}
		<img alt={name} class="mx-auto mb-4 h-10 object-contain" src={logo} />
	{:else}
		<div class="mb-4 flex h-10 items-center justify-center">
			<span class="text-base font-bold text-white/80">{name}</span>
		</div>
	{/if}

	<!-- Rewards -->
	<div class="mb-4">
		<div class="mb-2 text-center text-xs font-bold uppercase tracking-wider" style="color: rgb(168, 162, 158);">
			REWARDS
		</div>
		<div class="space-y-1">
			{#if mainReward}
				<div class="text-center text-sm font-bold" style="color: rgb(254, 243, 226);">{mainReward}</div>
			{/if}
			{#each rewardLines as line}
				<div class="text-center text-xs" style="color: rgb(254, 243, 226);">{line}</div>
			{/each}
			{#if !mainReward && rewardLines.length === 0}
				<div class="text-center text-sm font-bold" style="color: rgb(254, 243, 226);">COMING SOON</div>
			{/if}
		</div>
	</div>

	<!-- Code box -->
	<div class="mb-4 flex items-center justify-between rounded-lg px-3 py-2" style="background-color: rgba(0, 0, 0, 0.3);">
		<span class="text-xs" style="color: rgb(168, 162, 158);">Code:</span>
		<div class="flex items-center gap-1">
			<span class="text-sm font-bold" style={`color: ${color};`}>{code}</span>
			<button
				class="rounded p-1 transition-colors hover:bg-white/10"
				style="color: rgb(168, 162, 158);"
				onclick={handleCopy}
			>
				{#if justCopied}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- CTA Button -->
	<a href={href} target="_blank" rel="noopener noreferrer">
		<button
			class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-black"
			style={`background-color: ${color}; box-shadow: rgba(255,255,255,0.3) 0px 2px 0px 0px inset, rgba(0,0,0,0.04) 0px 4px 6px;`}
		>
			CLAIM BONUS
		</button>
	</a>
</div>
