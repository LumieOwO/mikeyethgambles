<script lang="ts">
	import type { IYoutubeFeed } from '$lib/types';
	import { onMount } from 'svelte';

	interface Props {
		youtubeFeed?: IYoutubeFeed | null;
	}

	let { youtubeFeed = null }: Props = $props();

	let currentIndex = $state(0);

	onMount(() => {
		currentIndex = 0;
	});

	function prev() {
		if (!youtubeFeed?.items) return;
		currentIndex = (currentIndex - 1 + youtubeFeed.items.length) % youtubeFeed.items.length;
	}

	function next() {
		if (!youtubeFeed?.items) return;
		currentIndex = (currentIndex + 1) % youtubeFeed.items.length;
	}
</script>

<div class="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
	{#if youtubeFeed?.items}
		<div
			class="flex transition-transform duration-500 ease-in-out"
			style="transform: translateX(-{currentIndex * 100}vw);"
		>
			{#each youtubeFeed.items as item, i}
				<div
					class="flex h-screen w-screen flex-shrink-0 flex-col items-center justify-center text-white"
				>
					<a href={item.link} target="_blank" rel="noreferrer" class="flex flex-col items-center">
						<img
							src={item.thumbnail}
							alt={item.title}
							class="aspect-video w-[80vw] max-w-5xl rounded-2xl object-cover shadow-xl"
						/>
						<p class="mt-6 text-xl font-bold">{item.title}</p>
						<p class="mt-2 text-sm text-gray-400">{new Date(item.pubDate).toDateString()}</p>
					</a>
				</div>
			{/each}
		</div>

	{/if}
</div>
