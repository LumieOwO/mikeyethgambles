<script lang="ts">
	import { page } from '$app/state';

	let { children }: { children: any } = $props();

	const tabs = [
		{ href: '/admin/socials', label: 'Social Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
		{ href: '/admin/appearance', label: 'Appearance', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
		{ href: '/admin/bonuses', label: 'Bonuses', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
		{ href: '/admin/leaderboards', label: 'Leaderboards', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
	];

	const activeTab = $derived(tabs.find(t => page.url.pathname.startsWith(t.href)));

	function isActive(tabHref: string): boolean {
		return page.url.pathname.startsWith(tabHref);
	}
</script>

<div class="flex min-h-screen bg-[#111318] overflow-hidden">
	<!-- Sidebar -->
	<aside class="flex w-[260px] flex-col border-r border-[#2a2d35] bg-[#181a20]">
		<!-- Logo / Brand -->
		<div class="flex h-[72px] items-center gap-3 px-6">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-black text-white shadow-lg shadow-blue-500/25">
				C
			</div>
			<div>
				<span class="text-[15px] font-bold text-white">Admin</span>
				<p class="text-[11px] text-[#6b7280]">Manage your site</p>
			</div>
		</div>

		<div class="mx-4 h-px bg-[#2a2d35]"></div>

		<!-- Nav label -->
		<div class="px-6 pt-5 pb-2">
			<span class="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#4b5063]">Navigation</span>
		</div>

		<nav class="flex flex-1 flex-col gap-0.5 px-3">
			{#each tabs as tab}
				<a
					href={tab.href}
					class="group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-200
						{isActive(tab.href)
							? 'bg-[#1f2937] text-white'
							: 'text-[#8b8fa3] hover:bg-[#1c1f27] hover:text-[#c9cdd8]'}"
				>
					{#if isActive(tab.href)}
						<div class="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-500"></div>
					{/if}
					<svg class="h-[18px] w-[18px] shrink-0 transition-colors duration-200 {isActive(tab.href) ? 'text-blue-400' : 'text-[#555a6e] group-hover:text-[#8b8fa3]'}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d={tab.icon} />
					</svg>
					{tab.label}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="space-y-0.5 border-t border-[#2a2d35] p-3">
			<a
				href="/admin/logout"
				class="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-red-400/60 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
			>
				<svg class="h-[18px] w-[18px] shrink-0 text-red-400/40 transition-colors group-hover:text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
				Logout
			</a>
			<a
				href="/"
				class="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#6b7280] transition-all duration-200 hover:bg-[#1c1f27] hover:text-[#9ca3af]"
			>
				<svg class="h-[18px] w-[18px] shrink-0 text-[#4b5063] transition-colors group-hover:text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to site
			</a>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-y-auto">
		<!-- Top bar -->
		<header class="flex h-[72px] items-center justify-between border-b border-[#2a2d35] px-8">
			<div class="flex items-center gap-3">
				{#if activeTab}
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1f2937]">
						<svg class="h-4 w-4 text-[#8b8fa3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d={activeTab.icon} />
						</svg>
					</div>
					<div>
						<h1 class="text-[15px] font-semibold text-white">{activeTab.label}</h1>
					</div>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<div class="flex items-center gap-2 rounded-lg border border-[#2a2d35] bg-[#181a20] px-3 py-1.5">
					<div class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"></div>
					<span class="text-xs text-[#8b8fa3]">Online</span>
				</div>
			</div>
		</header>

		<!-- Page content -->
		<main class="flex-1 p-8">
			{@render children?.()}
		</main>
	</div>
</div>
