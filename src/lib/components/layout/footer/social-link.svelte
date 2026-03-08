<script module lang="ts">
	export type socialIconType = 'twitter' | 'message-circle' | 'play';
</script>

<script lang="ts">
	let {
		title,
		href,
		icon,
		cardBackground
	}: { cardBackground: string; title: string; href: string; icon?: string } = $props();
</script>

<li>
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center justify-center gap-1 p-1 text-center text-xs text-[#777777] transition-colors hover:text-white"
	>
		<img
			src={`/images/footer/icons/socials/${icon}`}
			width="25"
			height="25"
			alt={`${title}'s ${icon}`}
		/>
		<!-- {title} -->
	</a>
</li>
