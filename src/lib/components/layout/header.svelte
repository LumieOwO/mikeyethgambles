<script lang="ts">
	import { page } from '$app/state';
	import type { Icreator } from '$lib/types';
	import { normalizeSiteName } from '$lib/utils';

	let { creator }: { creator: Icreator } = $props();

	const firstLb = creator.websiteLeaderboards?.[0];
	type NavLink = { href: string; label: string };
	const navLinks: NavLink[] = [
		{ href: '/', label: 'Home' },
		...(firstLb
			? [{
				href: `/leaderboard/${normalizeSiteName(firstLb.siteName)}`,
				label: 'Leaderboards'
			}]
			: [])
	];

	const normalize = (str: string) => str.replace(/\/+$/, '');
	let activeHref = $state<string>('/');
	let navContainer: HTMLElement | undefined = $state();
	let indicator: HTMLDivElement | undefined = $state();
	let scrolled = $state(false);

	function setActive(href: string, el: HTMLAnchorElement) {
		if (!indicator || !navContainer) return;
		activeHref = href || '/';
		const containerRect = navContainer.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		indicator.style.width = `${elRect.width}px`;
		indicator.style.transform = `translateX(${elRect.left - containerRect.left}px)`;
	}

	$effect(() => {
		if (!navContainer) return;
		const path = normalize(page.url.pathname);
		const sortedLinks = Array.from(navContainer.querySelectorAll('a[data-nav]')).sort(
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

	$effect(() => {
		const onScroll = () => { scrolled = window.scrollY > 20; };
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header
	class="fixed top-0 left-0 z-50 w-full transition-all duration-500
		{scrolled ? 'py-2' : 'py-4'}"
>
	<div
		class="mx-auto flex max-w-[1400px] items-center justify-between px-5 sm:px-10"
	>
		<!-- Left: Brand -->
		<a href="/" class="flex items-center gap-3 transition-opacity hover:opacity-80">
			{#if creator.logoUrl}
				<img
					src={creator.logoUrl}
					alt={creator.name}
					width="36"
					height="36"
					class="rounded-xl object-contain"
				/>
			{:else}
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
					style="background-color: var(--primary-color);"
				>
					{creator.name.charAt(0)}
				</div>
			{/if}
			<span class="text-[15px] font-bold text-white max-[420px]:hidden">{creator.name}</span>
		</a>

		<!-- Center: Nav -->
		<nav
			bind:this={navContainer}
			class="relative flex items-center rounded-2xl border px-1.5 py-1.5 transition-all duration-500
				{scrolled
					? 'border-[#2a2d35] bg-[#111318]/90 shadow-lg shadow-black/30 backdrop-blur-xl'
					: 'border-[#1e2028] bg-[#0e1015]/80 backdrop-blur-md'}"
		>
			<!-- Sliding indicator -->
			<div
				bind:this={indicator}
				class="absolute top-1.5 left-0 h-[calc(100%-12px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
				style="width: 0; transform: translateX(0); background-color: color-mix(in srgb, var(--primary-color) 20%, transparent);"
			></div>

			{#each navLinks as link}
				<a
					href={link.href}
					data-nav
					class="relative z-10 rounded-xl px-5 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200
						{link.href === activeHref
							? 'text-white'
							: 'text-[#6b7280] hover:text-[#d1d5db]'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Right: Socials -->
		<div class="flex items-center gap-1 max-[520px]:hidden">
			{#each creator.socials as social}
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					class="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
				>
					<img
						src={`/images/home/icons/socials/${social.icon}`}
						width="18"
						height="18"
						alt={social.title}
						class="opacity-50 transition-opacity hover:opacity-90"
					/>
				</a>
			{/each}
		</div>
	</div>
</header>
