<script lang="ts">
	import { enhance } from '$app/forms';

	let { form }: { form: { error?: string } | null } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
	<div class="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
		<h1 class="mb-6 text-center text-2xl font-bold text-white">Admin Panel</h1>

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance>
			<label class="mb-2 block text-sm font-medium text-white/60" for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				required
				class="mb-6 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-white/30"
				placeholder="Enter admin password"
			/>
			<button
				type="submit"
				class="w-full rounded-lg bg-white/10 py-3 font-semibold text-white transition hover:bg-white/20"
			>
				Login
			</button>
		</form>
	</div>
</div>
