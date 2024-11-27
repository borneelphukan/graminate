<script lang="ts">
	type ButtonData = {
		name: string;
		view: string;
	};

	export let buttons: ButtonData[] = [];
	export let activeView: string = 'profile';

	const setActive = (view: string) => {
		dispatch('navigate', { view });
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<div class="flex border-gray-400">
	{#each buttons as { name, view }}
		<button
			class="flex-1 px-4 py-2 text-center text-sm font-medium
                 border border-gray-300 bg-gray-500 focus:outline-none
                 {activeView === view
				? 'border-b-transparent bg-neutral-50 font-semibold'
				: 'text-gray-100 font-thin '}"
			on:click={() => setActive(view)}
		>
			{name}
		</button>
	{/each}
</div>
