<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { fade, slide, fly } from 'svelte/transition';

	let { data, form }: {
		data: { socials: { id: string; platform: string; url: string; title: string }[] };
		form: { success?: boolean; error?: string } | null;
	} = $props();

	const platforms = [
		{ key: 'youtube', label: 'YouTube', color: '#FF0000', placeholder: 'https://youtube.com/@YourChannel', svg: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' },
		{ key: 'discord', label: 'Discord', color: '#5865F2', placeholder: 'https://discord.gg/your-invite', svg: '<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>' },
		{ key: 'tiktok', label: 'TikTok', color: '#FFFFFF', placeholder: 'https://tiktok.com/@YourName', svg: '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>' },
		{ key: 'twitter', label: 'X / Twitter', color: '#FFFFFF', placeholder: 'https://x.com/YourHandle', svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
		{ key: 'twitch', label: 'Twitch', color: '#9146FF', placeholder: 'https://twitch.tv/YourChannel', svg: '<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>' },
		{ key: 'kick', label: 'Kick', color: '#53FC18', placeholder: 'https://kick.com/YourChannel', svg: '<path d="M1.333 0h8v5.333H12V2.667h2.667V0h8v8H20v2.667h-2.667v2.666H20V16h2.667v8h-8v-2.667H12v-2.666H9.333V24h-8Z"/>' },
	];

	let selectedPlatform = $state('');
	let linkUrl = $state('');

	const canSubmit = $derived(selectedPlatform && linkUrl.trim());
	const selectedPlatformInfo = $derived(platforms.find(p => p.key === selectedPlatform));

	function getPlatform(key: string) {
		return platforms.find(p => p.key === key);
	}
</script>

<div class="mx-auto max-w-4xl space-y-8">
	<!-- Header -->
	<div in:fly={{ y: -10, duration: 300 }}>
		<h1 class="mb-1 text-2xl font-bold text-white">Your Socials</h1>
		<p class="text-sm text-white/50">
			Add your social media profiles to display on your affiliate site
		</p>
	</div>

	{#if form?.error}
		<div
			class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
			transition:fade={{ duration: 200 }}
		>
			{form.error}
		</div>
	{/if}

	<!-- Add New Link -->
	<div in:fly={{ y: 10, duration: 300, delay: 100 }}>
		<Card.Root class="border-white/[0.06] bg-white/[0.025]">
			<Card.Header>
				<Card.Title class="text-white">Add New Link</Card.Title>
				<Card.Description class="text-white/40">
					Connect your social media accounts so visitors can find you everywhere
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					method="POST"
					action="?/create"
					class="space-y-5"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							selectedPlatform = '';
							linkUrl = '';
						};
					}}
				>
					<div class="space-y-3">
						<Label class="text-white/60">Select Platform</Label>
						<div class="flex flex-wrap gap-3">
							{#each platforms as platform}
								<button
									type="button"
									class="flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-200
										{selectedPlatform === platform.key
											? 'border-white/30 bg-white/[0.08] ring-1 ring-white/20'
											: 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'}"
									onclick={() => (selectedPlatform = platform.key)}
								>
									<svg class="h-6 w-6" viewBox="0 0 24 24" fill={platform.color}>
										{@html platform.svg}
									</svg>
								</button>
							{/each}
						</div>
						<input type="hidden" name="platform" value={selectedPlatform} />
					</div>

					{#if selectedPlatform}
						<div class="space-y-2" transition:slide={{ duration: 200 }}>
							<Label class="text-white/60">
								{selectedPlatformInfo?.label} URL
							</Label>
							<Input
								class="border-white/[0.08] bg-transparent text-white placeholder:text-white/25 hover:border-white/15 focus:border-white/20 focus:ring-1 focus:ring-white/10"
								placeholder={selectedPlatformInfo?.placeholder}
								name="url"
								bind:value={linkUrl}
							/>
						</div>
					{/if}

					<Separator class="bg-white/[0.04]" />

					<div class="flex justify-end">
						<Button
							type="submit"
							disabled={!canSubmit}
							class="gap-2 bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
							</svg>
							Add Link
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Existing Socials -->
	<div class="space-y-4" in:fly={{ y: 10, duration: 300, delay: 200 }}>
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-white">Your Socials</h2>
			<span class="text-xs text-white/30">
				{data.socials.length} link{data.socials.length !== 1 ? 's' : ''} total
			</span>
		</div>

		{#if data.socials.length === 0}
			<Card.Root class="border-dashed border-white/[0.06] bg-transparent">
				<Card.Content class="flex flex-col items-center gap-3 py-14">
					<svg class="h-10 w-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
					<p class="text-sm text-white/25">No social links yet. Add your first one above.</p>
				</Card.Content>
			</Card.Root>
		{/if}

		<div class="space-y-2">
			{#each data.socials as social, idx (social.id)}
				{@const platform = getPlatform(social.platform)}
				<div
					in:fly={{ y: 8, duration: 250, delay: idx * 50 }}
					out:fade={{ duration: 150 }}
				>
					<Card.Root class="border-white/[0.06] bg-white/[0.02] transition-colors hover:bg-white/[0.035]">
						<div class="flex items-center justify-between gap-4 px-5 py-4">
							<div class="flex min-w-0 flex-1 items-center gap-4">
								<div
									class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
									style="background-color: {platform ? `${platform.color}14` : 'rgba(255,255,255,0.06)'};"
								>
									{#if platform}
										<svg class="h-5 w-5" viewBox="0 0 24 24" fill={platform.color}>
											{@html platform.svg}
										</svg>
									{:else}
										<svg class="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
										</svg>
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<span class="font-semibold text-white">{platform?.label ?? social.platform}</span>
									<div class="mt-0.5 flex items-center gap-2">
										<span class="max-w-[280px] truncate text-sm text-white/30">{social.url}</span>
									</div>
								</div>
							</div>

							<div class="flex flex-shrink-0 items-center gap-1">
								<!-- Visit -->
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-white/25 hover:text-white/70"
									href={social.url}
									target="_blank"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
									</svg>
								</Button>
								<!-- Delete -->
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={social.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-white/25 hover:text-red-400"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
										</svg>
									</Button>
								</form>
							</div>
						</div>
					</Card.Root>
				</div>
			{/each}
		</div>
	</div>
</div>
