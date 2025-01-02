<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount, onDestroy } from 'svelte';

	export let items: string[] = [];
	export let direction: 'up' | 'down' = 'down';
	export let placeholder: string = 'Select';
	export let selectedItems: string[] = [];

	const dispatch = createEventDispatcher();
	let isOpen = false;
	let dropdownRef: HTMLDivElement | null = null;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function isItemSelected(item: string): boolean {
		return selectedItems.includes(item);
	}

	function toggleItem(item: string) {
		if (isItemSelected(item)) {
			selectedItems = selectedItems.filter((selectedItem) => selectedItem !== item);
		} else {
			selectedItems = [...selectedItems, item];
		}
		dispatch('change', selectedItems);
	}

	// Close dropdown if clicked outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		// Ensure this runs only in the browser
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		// Ensure cleanup happens only in the browser
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative inline-block text-left w-auto" bind:this={dropdownRef}>
	<button
		class="w-full hover:bg-gray-400 focus:bg-green-400 focus:text-green-100 text-sm font-semibold px-4 py-2 rounded-md text-left flex items-center justify-between"
		on:click={toggleDropdown}
	>
		<span>{placeholder}</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="w-5 h-5"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
		</svg>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div
			class={`absolute z-10 w-auto mx-4 bg-white rounded-md shadow-lg mt-2 ${
				direction === 'up' ? 'bottom-full mb-2' : ''
			}`}
		>
			{#each items as item}
				<label class="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-400">
					<input
						type="checkbox"
						class="form-checkbox text-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
						checked={isItemSelected(item)}
						on:click={() => toggleItem(item)}
					/>
					<span class="ml-2 text-sm text-gray-700">{item}</span>
				</label>
			{/each}
		</div>
	{/if}
</div>
