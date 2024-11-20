<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let items: string[] = []; // List of dropdown items
	export let selectedItem: string = items[0]; // Default selected item

	const dispatch = createEventDispatcher();

	let isOpen = false; // State to track if the dropdown is open

	const toggleDropdown = () => {
		isOpen = !isOpen;
	};

	const selectItem = (item: string) => {
		selectedItem = item;
		isOpen = false;
		dispatch('select', { item }); // Emit event with the selected item
	};
</script>

<div class="relative inline-block text-left">
	<!-- Selected Item Button -->
	<button
		class="flex items-center px-4 py-2 text-sm rounded-md bg-white hover:underline"
		on:click={toggleDropdown}
	>
		{selectedItem}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="w-5 h-5 ml-2 -mr-1 text-gray-300"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<ul class="absolute z-10 mt-2 w-32 bg-white rounded-md shadow-lg">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			{#each items as item}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="px-4 py-2 text-blue-100 text-sm font-medium cursor-pointer hover:bg-gray-400"
					on:click={() => selectItem(item)}
				>
					{item}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* Optional additional styles can go here */
</style>
