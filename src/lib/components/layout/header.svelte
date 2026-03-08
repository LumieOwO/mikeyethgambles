<script lang="ts">
	import { page } from '$app/state';
	import { CdnUrl } from '$lib/data/config';
	import type { Icreator } from '$lib/server/data/types';
	import { normalizeSiteName } from '$lib/utils';
	let { creator }: { creator: Icreator } = $props();
	const firstWithPrizes = creator.websiteLeaderboards?.find((lb) => lb.prizes != null);
	type NavLink = { href: string; label: string };
	const navLinks: NavLink[] = [
		{ href: '/', label: 'Homepage' },
		{
			href: firstWithPrizes ? `/leaderboard/${normalizeSiteName(firstWithPrizes.siteName)}` : '/',

			label: 'Leaderboards'
		}
	];

	const normalize = (str: string) => str.replace(/\/+$/, '');
	let activeHref = $state<string>('/');
	let navContainer: HTMLElement | undefined = $state();
	let indicator: HTMLDivElement | undefined = $state();

	function setActive(href: string, el: HTMLAnchorElement) {
		if (!indicator) return;
		activeHref = href || '/';
		indicator.style.width = `${el.offsetWidth}px`;
		indicator.style.transform = `translateX(${el.offsetLeft}px)`;
	}

	$effect(() => {
		if (!navContainer) return;
		const path = normalize(page.url.pathname);
		const sortedLinks = Array.from(navContainer.querySelectorAll('a')).sort(
			(a, b) => (b.getAttribute('href')?.length ?? 0) - (a.getAttribute('href')?.length ?? 0)
		);

		const activeEl = sortedLinks.find((a) => {
			const href = a.getAttribute('href');
			if (!href) return false;
			const nHref = normalize(href);
			return path === nHref || path.startsWith(nHref + '/');
		}) as HTMLAnchorElement | undefined;

		if (activeEl) setActive(normalize(activeEl.getAttribute('href') || '/'), activeEl);
	});
</script>

<header class="fixed top-0 left-0 z-50 w-full">
	<div
		class="flex h-[90px] items-center justify-center min-[460px]:justify-between min-[460px]:px-[40px]"
	>
		<a href="/" class="flex items-center gap-2 max-[460px]:hidden">
			<img src={`/images/home/penguin.png`} alt="Logo" class="h-10 w-10 rounded" />
		</a>
		<nav
			bind:this={navContainer}
			class="relative flex h-[56px] items-center gap-8 rounded-2xl bg-black/60"
		>
			<div class="flex gap-8 px-[40px]">
				{#each navLinks as link}
					<a
						href={link.href}
						class="relative z-10 text-[18px] font-medium transition-colors hover:text-white {link.href ==
						activeHref
							? 'text-white'
							: 'text-[#777777]'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<div
				bind:this={indicator}
				class="absolute bottom-0 h-[3px] rounded-full bg-[var(--primary-color)] transition-all duration-300 ease-in-out"
				style="width: 0; transform: translateX(0);"
			></div>
		</nav>

		<div class="rounded-xl font-semibold text-white transition-colors max-[460px]:hidden"></div>
	</div>
</header>
