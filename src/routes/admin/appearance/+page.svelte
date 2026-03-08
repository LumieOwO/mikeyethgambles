<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form }: {
		data: { logoUrl: string; primaryColor: string };
		form: { success?: boolean; error?: string; logoUrl?: string; colorSaved?: boolean } | null;
	} = $props();

	let previewUrl = $state(data.logoUrl);
	let fileInput: HTMLInputElement | undefined = $state();

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) {
			previewUrl = URL.createObjectURL(input.files[0]);
		}
	}

	let showSuccess = $state(false);

	$effect(() => {
		if (form?.success) {
			if (form.logoUrl) previewUrl = form.logoUrl;
			showSuccess = true;
			const t = setTimeout(() => (showSuccess = false), 3000);
			return () => clearTimeout(t);
		}
	});
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-2 text-2xl font-bold text-white">Appearance</h1>
	<p class="mb-8 text-sm text-white/40">Customize your site's logo and brand color.</p>

	{#if showSuccess}
		<div class="mb-6 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
			{form?.colorSaved ? 'Brand color saved.' : 'Logo uploaded successfully.'}
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{form.error}
		</div>
	{/if}

	<!-- Logo Upload -->
	<div class="mb-8 rounded-xl border border-white/10 bg-white/[0.02] p-6">
		<h2 class="mb-4 text-lg font-semibold text-white">Logo / Profile Picture</h2>

		<div class="flex items-start gap-6">
			<div class="shrink-0">
				<img
					src={previewUrl}
					alt="Current logo"
					class="h-32 w-32 rounded-xl border border-white/10 object-cover"
				/>
			</div>

			<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance class="flex flex-1 flex-col gap-4">
				<div
					class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 p-6 transition hover:border-white/30"
					role="button"
					tabindex="0"
					onclick={() => fileInput?.click()}
					onkeydown={(e) => { if (e.key === 'Enter') fileInput?.click(); }}
				>
					<svg class="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<p class="text-sm text-white/40">Click to upload (PNG, JPG, WebP, max 5MB)</p>
				</div>

				<input
					bind:this={fileInput}
					type="file"
					name="logo"
					accept="image/png,image/jpeg,image/webp,image/gif"
					class="hidden"
					onchange={handleFileSelect}
				/>

				<button
					type="submit"
					class="self-end rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
				>
					Upload Logo
				</button>
			</form>
		</div>
	</div>

	<!-- Brand Color -->
	<div class="rounded-xl border border-white/10 bg-white/[0.02] p-6">
		<h2 class="mb-4 text-lg font-semibold text-white">Brand Color</h2>

		<form method="POST" action="?/color" use:enhance class="flex items-end gap-4">
			<div class="flex-1">
				<label class="mb-1 block text-xs font-medium text-white/50" for="primaryColor">
					Primary Color (hex) — leave blank to use default
				</label>
				<div class="flex gap-3">
					<input
						type="color"
						name="primaryColor"
						id="primaryColor"
						value={data.primaryColor || '#5170FF'}
						class="h-10 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
					/>
					<input
						type="text"
						name="primaryColor"
						value={data.primaryColor || ''}
						placeholder="#5170FF"
						class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
					/>
				</div>
			</div>

			<button
				type="submit"
				class="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
			>
				Save Color
			</button>
		</form>
	</div>
</div>
