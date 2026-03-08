<script lang="ts">
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';

	type Props = {
		seconds: number;
	};

	let { seconds }: Props = $props();

	let days = $state(0);
	let hh = $state(0);
	let mm = $state(0);
	let ss = $state(0);

	$effect(() => {
		days = Math.floor(seconds / 86400);
		hh = Math.floor((seconds % 86400) / 3600);
		mm = Math.floor((seconds % 3600) / 60);
		ss = Math.floor(seconds % 60);
	});
</script>

<NumberFlowGroup>
	<div class="flex items-center gap-3">
		<div class="flex flex-col items-center gap-1">
			<div
				class="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-[#2a2d35] bg-[#161820] text-[22px] font-bold text-white"
			>
				<NumberFlow trend={-1} value={days} format={{ minimumIntegerDigits: 1 }} />
			</div>
			<span
				class="font-['Source_Code_Pro',monospace] text-[9px] font-semibold tracking-[1px] text-[#4b5063] uppercase"
				>DAY</span
			>
		</div>
		<span class="mb-4 text-[18px] text-[#4b5063]">:</span>
		<div class="flex flex-col items-center gap-1">
			<div
				class="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-[#2a2d35] bg-[#161820] text-[22px] font-bold text-white"
			>
				<NumberFlow trend={-1} value={hh} format={{ minimumIntegerDigits: 2 }} />
			</div>
			<span
				class="font-['Source_Code_Pro',monospace] text-[9px] font-semibold tracking-[1px] text-[#4b5063] uppercase"
				>HR</span
			>
		</div>
		<span class="mb-4 text-[18px] text-[#4b5063]">:</span>
		<div class="flex flex-col items-center gap-1">
			<div
				class="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-[#2a2d35] bg-[#161820] text-[22px] font-bold text-white"
			>
				<NumberFlow
					trend={-1}
					value={mm}
					digits={{ 1: { max: 5 } }}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span
				class="font-['Source_Code_Pro',monospace] text-[9px] font-semibold tracking-[1px] text-[#4b5063] uppercase"
				>MIN</span
			>
		</div>
		<span class="mb-4 text-[18px] text-[#4b5063]">:</span>
		<div class="flex flex-col items-center gap-1">
			<div
				class="flex h-[52px] w-[52px] items-center justify-center rounded-lg border border-[#2a2d35] bg-[#161820] text-[22px] font-bold text-white"
			>
				<NumberFlow
					trend={-1}
					value={ss}
					digits={{ 1: { max: 5 } }}
					format={{ minimumIntegerDigits: 2 }}
				/>
			</div>
			<span
				class="font-['Source_Code_Pro',monospace] text-[9px] font-semibold tracking-[1px] text-[#4b5063] uppercase"
				>SEC</span
			>
		</div>
	</div>
</NumberFlowGroup>
