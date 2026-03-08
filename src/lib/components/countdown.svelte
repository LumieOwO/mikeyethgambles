<script lang="ts">
	import NumberFlow, { NumberFlowGroup } from '@number-flow/svelte';

	type Props = {
		seconds: number;
	};

	let { seconds }: Props = $props();

	let days = $state(0);
	let hh = $state(0);
	let mm = $state(0);

	$effect(() => {
		days = Math.floor(seconds / 86400);
		hh = Math.floor((seconds % 86400) / 3600);
		mm = Math.floor((seconds % 3600) / 60);
	});
</script>

<NumberFlowGroup>
	<div class="~text-3xl/4xl flex items-baseline gap-1 font-semibold text-white">
		<NumberFlow trend={-1} value={days} format={{ minimumIntegerDigits: 1 }} />
		<span class="text-lg text-[#777777]">:</span>
		<NumberFlow trend={-1} value={hh} format={{ minimumIntegerDigits: 2 }} />
		<span class="text-lg text-[#777777]">:</span>
		<NumberFlow
			trend={-1}
			value={mm}
			digits={{ 1: { max: 5 } }}
			format={{ minimumIntegerDigits: 2 }}
		/>
	</div>
</NumberFlowGroup>
