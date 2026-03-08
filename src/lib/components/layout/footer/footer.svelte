<script lang="ts">
	import type { Icreator } from '$lib/types';
	let { creator }: { creator: Icreator } = $props();
</script>

<footer class="relative z-10 border-t border-[#1e2028] bg-[#0a0c14]">
	<div class="mx-auto flex max-w-[1400px] flex-col gap-8 px-8 py-12 sm:px-10">
		<!-- Top row -->
		<div class="flex flex-wrap items-start justify-between gap-8">
			<!-- Brand + disclaimer -->
			<div class="max-w-md space-y-4">
				<div class="flex items-center gap-3">
					{#if creator.logoUrl}
						<img
							src={creator.logoUrl}
							alt={creator.name}
							width="28"
							height="28"
							class="rounded-lg object-contain"
						/>
					{:else}
						<div
							class="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
							style="background-color: var(--primary-color);"
						>
							{creator.name.charAt(0)}
						</div>
					{/if}
					<span class="text-sm font-bold text-white/80">{creator.name}</span>
				</div>
				<p class="text-[12px] leading-relaxed text-[#6b7280]">
					Responsible Gambling Advisory: While gambling can be entertaining, it's crucial to
					be aware of the associated risks. Exercise self-control, set limits, and seek support
					if needed. We are not responsible for any losses or damages caused by gambling.
				</p>
			</div>

			<!-- Socials -->
			<div class="flex flex-col items-end gap-3">
				<span class="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#4b5063]">Socials</span>
				<div class="flex items-center gap-2">
					{#each creator.socials as social}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2d35] bg-[#161820] transition-all duration-200 hover:border-[#3a3d45] hover:bg-[#1e2028]"
						>
							<img
								src={`/images/footer/icons/socials/${social.icon}`}
								width="16"
								height="16"
								alt={social.title}
								class="opacity-50 transition-opacity hover:opacity-80"
							/>
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Divider -->
		<div class="h-px bg-[#1e2028]"></div>

		<!-- Bottom row -->
		<div class="flex flex-wrap items-center justify-between gap-4">
			<a
				href="https://begambleaware.org"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[11px] font-semibold uppercase tracking-wider text-[#4b5063] transition-colors hover:text-[#6b7280]"
			>
				BeGambleAware.org
			</a>
			<p class="text-[11px] text-[#3a3d4a]">
				&copy; {new Date().getFullYear()} {creator.name}. All rights reserved.
			</p>
		</div>
	</div>
</footer>
