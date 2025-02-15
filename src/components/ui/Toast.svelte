<script lang="ts">
	import { showToast, toastMessage } from '../../stores/toast';
	import { fly } from 'svelte/transition';

	let isVisible = false;
	$: showToast.subscribe((value) => (isVisible = value));
</script>

{#if isVisible}
	<div
		class="fixed bottom-4 md:bottom-6 right-4 md:right-6 left-4 md:left-auto max-w-xs md:max-w-sm px-4 py-3 bg-green-600 text-white rounded-lg shadow-md text-center md:text-left transition-all duration-300"
		in:fly={{ y: 20, duration: 300 }}
		out:fly={{ y: 20, duration: 300 }}
	>
		<p class="text-sm font-semibold">{$toastMessage}</p>
	</div>
{/if}
