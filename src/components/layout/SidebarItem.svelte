<script lang="ts">
	import { Fa } from 'svelte-fa';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

	export let icon: IconDefinition;
	export let label: string;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-100"
	on:click
>
	<div class="text-gray-500 dark:text-white">
		<Fa {icon} />
	</div>
	<span class="text-gray-800 dark:text-gray-500 font-medium">{label}</span>
</div>