<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children }: { children: any } = $props();
</script>

<ModeWatcher defaultMode="dark" />

{@render children?.()}
