<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Icreator } from '$lib/server/data/types';
	import SocialLink from './social-link.svelte';
	let { creator }: { creator: Icreator } = $props();
	const infoLinks: any[] = [
		/* { label: 'Privacy Policy', href: '/pf' },
		{ label: 'Terms of Service', href: '/privacy-policy' } */
	];
</script>

<footer
	class="relative z-10 flex min-h-[170px] w-full justify-between overflow-hidden bg-[#040404] p-8"
>
	<div class="flex flex-col items-start justify-center gap-4 text-start">
		<Button
			class="h-0 !p-0 text-[17px] font-semibold"
			variant="link"
			target="_blank"
			href="https://begambleaware.org"
		>
			BEGAMBLEAWARE.ORG
		</Button>

		<p class="text-xs leading-relaxed text-[#777777]">
			Responsible Gambling Advisory: While gambling can be entertaining, it’s crucial to<br />
			be aware of the associated risks. Exercise self-control, set limits, and seek support<br />
			if needed. Enjoy the excitement responsibly and prioritize your well-being. We are<br />
			not responsible for any losses or damages caused by gambling.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-14">
		{#if infoLinks.length > 0}
			<div>
				<h3 class="mb-2 text-xl font-semibold text-white">INFO</h3>
				<ul class="space-y-2">
					{#each infoLinks as link}
						<li>
							<a class="text-xs text-[#777777] transition-colors hover:text-white" href={link.href}>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div>
			<!-- <h3 class="mb-2 text-xl font-semibold text-white">SOCIALS</h3> -->
			<ul class="hidden w-full justify-end gap-4 lg:flex">
				{#each creator.socials as social}
					<SocialLink {...social} />
				{/each}
			</ul>
		</div>
	</div>
</footer>
